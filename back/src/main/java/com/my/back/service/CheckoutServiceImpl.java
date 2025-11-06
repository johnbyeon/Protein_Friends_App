// src/main/java/com/my/back/service/CheckoutServiceImpl.java
package com.my.back.service;

import com.my.back.dto.market.CheckoutPageDto;
import com.my.back.dto.market.PayResultDto;
import com.my.back.entity.*;
import com.my.back.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CheckoutServiceImpl implements CheckoutService {

    private final CartService cartService;                // 라인/합계 계산 재사용
    private final UserRepository userRepository;          // 주문자 정보(이름/uid)
    private final CartItemRepository cartItemRepository;  // 선택 라인 정리
    private final DiscountLogRepository discountLogRepository; // 쿠폰 사용처리
    private final PaymentLogRepository paymentLogRepository;   // 결제로그 저장/조회

    // ========== 주문서 ==========
    @Override
    public CheckoutPageDto checkoutPage(String email) {
        // 선택된 라인만 노출
        var items = cartService.getLines(email).stream()
                .filter(v -> Boolean.TRUE.equals(v.line().getSelected()))
                .toList();

        // 합계(배송비 포함)
        var totals = cartService.summarize(email);

        // 결제수단은 카드만
        return CheckoutPageDto.builder()
                .items(items)
                .totals(totals)
                .paymentMethods(List.of("CARD"))
                .build();
    }

    // ========== 결제(모의) ==========
    @Override
    @Transactional // 결제/쿠폰/장바구니 처리 원자화
    public PayResultDto payByCard(String email) {
        // 1) 사용자/선택 라인/합계 로드
        Users me = mustGetUser(email);
        var selectedLines = cartService.getLines(email).stream()
                .filter(v -> Boolean.TRUE.equals(v.line().getSelected()))
                .toList();
        if (selectedLines.isEmpty()) {
            throw new IllegalStateException("선택된 상품이 없습니다.");
        }
        var totals = cartService.summarize(email);
        BigDecimal payAmount = totals.payAmount(); // 배송비 포함 최종금액

        // 2) 주문번호/결제키 생성
        String orderId = buildOrderId(me.getUId(), selectedLines.size());    // 예: ORD-20251106-142233-2-UID5
        String paymentKey = UUID.randomUUID().toString();                    // 모의 결제키(UUID)

        // 3) 결제로그 저장(PaymentLog)
        PaymentLog log = PaymentLog.builder()
                .paymentKey(paymentKey)                              // PK
                .orderId(orderId)                                     // 주문번호
                .amount(payAmount)                                    // 결제금액
                .orderName("마켓주문 " + selectedLines.size() + "건")   // 주문명
                .customerName( safe(me.getName(), me.getEmail()) )    // 구매자명(없으면 이메일)
                .paymentTime(LocalDateTime.now())                     // 결제시각
                .status(PaymentStatus.DONE)                           // 완료 처리
                .build();
        paymentLogRepository.save(log);

        // 4) 라인에 적용된 쿠폰 '사용 처리'
        LocalDateTime now = LocalDateTime.now();
        for (var v : selectedLines) {
            Long recDisId = v.line().getAppliedDiscountId();
            if (recDisId == null) continue;
            // 내가 가진 + 지금 사용 가능한 쿠폰만 허용 (유효성 2중 검증)
            var dl = discountLogRepository.findOwned(me.getUId(), recDisId)
                    .orElseThrow(() -> new IllegalArgumentException("쿠폰을 사용할 수 없습니다. recDisId=" + recDisId));
            dl.setIsUsed(true);
            dl.setUsedDate(now);
            // JPA dirty checking으로 update 반영
        }

        // 5) 장바구니 선택 라인 비우기
        cartItemRepository.deleteSelected(me.getUId());

        // 6) 응답 DTO
        return PayResultDto.builder()
                .orderId(orderId)
                .paymentKey(paymentKey)
                .amount(payAmount)
                .status("DONE")
                .paidAt(log.getPaymentTime())
                .build();
    }

    // ========== 완료 요약 ==========
    @Override
    public PayResultDto completeSummary(String orderId) {
        PaymentLog log = Optional.ofNullable(paymentLogRepository.findByOrderId(orderId))
                .orElseThrow(() -> new NoSuchElementException("주문을 찾을 수 없습니다. orderId=" + orderId));

        return PayResultDto.builder()
                .orderId(log.getOrderId())
                .paymentKey(log.getPaymentKey())
                .amount(log.getAmount())
                .status( log.getStatus() == null ? "DONE" : log.getStatus().name() )
                .paidAt(log.getPaymentTime())
                .build();
    }

    // ========== 내부 유틸 ==========
    private Users mustGetUser(String email) {
        if (email == null || email.isBlank()) throw new IllegalStateException("인증 정보가 없습니다.");
        Users me = userRepository.findByEmail(email);
        if (me == null) throw new NoSuchElementException("유저를 찾을 수 없습니다. email=" + email);
        return me;
    }

    private String buildOrderId(Long uId, int itemCount) {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        return "ORD-" + ts + "-" + itemCount + "-UID" + uId;
    }

    private String safe(String name, String fallback) {
        if (name == null || name.isBlank()) return fallback;
        return name;
    }
}
