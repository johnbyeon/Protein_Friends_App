// src/main/java/com/my/back/service/MembershipPurchaseServiceImpl.java
package com.my.back.service;

import com.my.back.dto.market.*;
import com.my.back.entity.*;
import com.my.back.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MembershipPurchaseServiceImpl implements MembershipPurchaseService {

    private final MembershipServiceRepository membershipServiceRepository;
    private final MembershipLogRepository membershipLogRepository;
    private final UserRepository userRepository;
    private final PaymentLogRepository paymentLogRepository;
    private final DiscountQueryService discountQueryService;

    // ⚠️ 트레이너 리포지토리는 "수정 없이" 사용 (JpaRepository 기본 메서드만 활용)
    private final TrainerInfoRepository trainerInfoRepository;

    @Override
    public List<MembershipDto> listActive() {
        return membershipServiceRepository.findAll().stream()
                .filter(ms -> Boolean.TRUE.equals(ms.getIsActive()))
                .map(this::toDto)
                .toList();
    }

    @Override
    public MembershipCheckoutDto checkout(String email, Long msId) {
        Users me = mustUser(email);
        MembershipService ms = membershipServiceRepository.findById(msId)
                .orElseThrow(() -> new NoSuchElementException("회원권을 찾을 수 없습니다."));

        MembershipDto item = toDto(ms);
        BigDecimal goods = item.getEffectivePrice() != null ? item.getEffectivePrice() : item.getPrice();

        var coupons = discountQueryService.validMembershipCoupons(me.getUId()).stream()
                .map(dl -> SimpleCouponDto.builder()
                        .recDisId(dl.getRecDisId())
                        .name(dl.getDiscountService().getDisName())
                        .price(Optional.ofNullable(dl.getDiscountService().getDisPrice()).orElse(0))
                        .percent(Optional.ofNullable(dl.getDiscountService().getDisPercent()).orElse(0))
                        .build())
                .toList();

        return MembershipCheckoutDto.builder()
                .item(item)
                .coupons(coupons)
                .goodsAmount(goods)
                .couponDiscount(BigDecimal.ZERO)
                .payAmount(goods)
                .build();
    }

    @Override
    @Transactional
    public PayResultDto pay(String email, Long msId, Long recDisId) {
        Users me = mustUser(email);
        MembershipService ms = membershipServiceRepository.findById(msId)
                .orElseThrow(() -> new NoSuchElementException("회원권을 찾을 수 없습니다."));

        MembershipDto item = toDto(ms);
        BigDecimal goods = item.getEffectivePrice() != null ? item.getEffectivePrice() : item.getPrice();
        if (goods == null) goods = BigDecimal.ZERO;

        // MEMBERSHIP_DISCOUNT 쿠폰만 허용
        BigDecimal coupon = BigDecimal.ZERO;
        if (recDisId != null) {
            var owned = discountQueryService.findOwnedForType(
                    me.getUId(), recDisId, DiscountType.MEMBERSHIP_DISCOUNT, goods);
            var ds = owned.orElseThrow(() -> new IllegalArgumentException("해당 쿠폰을 사용할 수 없습니다."))
                    .getDiscountService();
            coupon = discountQueryService.computeCouponAmount(ds, goods);
        }
        BigDecimal pay = goods.subtract(coupon);
        if (pay.signum() < 0) pay = BigDecimal.ZERO;

        // 결제 로그
        String orderId = buildOrderId(me.getUId(), ms.getMembershipId());
        String paymentKey = UUID.randomUUID().toString();
        PaymentLog log = PaymentLog.builder()
                .paymentKey(paymentKey)
                .orderId(orderId)
                .amount(pay)
                .orderName(ms.getMembershipName())
                .customerName(safe(me.getName(), me.getEmail()))
                .paymentTime(LocalDateTime.now())
                .status(PaymentStatus.DONE)
                .build();
        paymentLogRepository.save(log);

        if (recDisId != null) discountQueryService.markUsed(me.getUId(), recDisId);

        // ✅ 트레이너 선택 (리포지토리 변경 없음)
        // 1) t_id = 1 우선, 2) 없으면 첫 번째 행, 3) 그래도 없으면 예외
        TrainerInfo trainer = trainerInfoRepository.findById(1L)
                .orElseGet(() ->
                        trainerInfoRepository.findAll(PageRequest.of(0, 1))
                                .stream().findFirst()
                                .orElseThrow(() -> new IllegalStateException("trainer_info에 최소 1명 등록 필요")) );

        // 멤버십 발급
        LocalDate start = LocalDate.now();
        LocalDate end = (item.getDays() == null ? start : start.plusDays(item.getDays())).minusDays(1);

        MembershipLog mlog = MembershipLog.builder()
                .membershipId(ms.getMembershipId())
                .membershipName(ms.getMembershipName())
                .users(me)
                .trainer(trainer) // ← NOT NULL 필드 충족
                .startDate(start)
                .endDate(end)
                .status(MembershipStatus.ACTIVE)
                .createDate(LocalDateTime.now())
                .price(item.getPrice() == null ? 0 : item.getPrice().intValue())
                .salePrice(item.getDiscountAmount() == null ? 0 : item.getDiscountAmount().intValue())
                .stopCount(0)
                .build();
        membershipLogRepository.save(mlog);

        return PayResultDto.builder()
                .orderId(orderId)
                .paymentKey(paymentKey)
                .amount(pay)
                .status("DONE")
                .paidAt(log.getPaymentTime())
                .build();
    }

    @Override
    public PayResultDto complete(String orderId) {
        PaymentLog log = Optional.ofNullable(paymentLogRepository.findByOrderId(orderId))
                .orElseThrow(() -> new NoSuchElementException("주문을 찾을 수 없습니다."));
        return PayResultDto.builder()
                .orderId(log.getOrderId())
                .paymentKey(log.getPaymentKey())
                .amount(log.getAmount())
                .status(log.getStatus() == null ? "DONE" : log.getStatus().name())
                .paidAt(log.getPaymentTime())
                .build();
    }

    // --- utils ---
    private Users mustUser(String email) {
        if (email == null || email.isBlank()) throw new IllegalStateException("인증 정보가 없습니다.");
        Users me = userRepository.findByEmail(email);
        if (me == null) throw new NoSuchElementException("유저를 찾을 수 없습니다. email=" + email);
        return me;
    }
    private String buildOrderId(Long uId, Long msId) {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        return "MS-" + ts + "-MID" + msId + "-UID" + uId;
    }
    private String safe(String name, String fb) { return (name == null || name.isBlank()) ? fb : name; }

    private MembershipDto toDto(MembershipService ms) {
        BigDecimal price = ms.getMembershipPrice() == null ? null : BigDecimal.valueOf(ms.getMembershipPrice());
        BigDecimal sale  = ms.getMembershipSalePrice() == null ? null : BigDecimal.valueOf(ms.getMembershipSalePrice());
        BigDecimal effective = (sale != null && sale.signum() > 0) ? sale : price;
        BigDecimal discount = (price != null && effective != null) ? price.subtract(effective) : BigDecimal.ZERO;

        return MembershipDto.builder()
                .id(ms.getMembershipId())
                .code(null)
                .name(ms.getMembershipName())
                .days(ms.getMembershipDurationDays())
                .imageUrl(ms.getMembershipPicUrl())
                .price(price)
                .salePrice(sale)
                .discountAmount(discount.signum() < 0 ? BigDecimal.ZERO : discount)
                .effectivePrice(effective)
                .build();
    }
}
