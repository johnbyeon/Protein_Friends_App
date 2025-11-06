package com.my.back.service;

import com.my.back.entity.DiscountLog;
import com.my.back.entity.DiscountService;
import com.my.back.entity.DiscountType;
import com.my.back.repository.DiscountLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * ===============================================================
 * ✅ DiscountQueryService
 * ---------------------------------------------------------------
 * 🔹 사용자가 보유한 쿠폰(DiscountLog)을 조회하고
 * 🔹 쿠폰의 사용 가능 여부(기간, 타입, 활성 상태, 최소금액 조건)를 검사하며
 * 🔹 실제 할인 금액 계산까지 수행하는 서비스
 * ===============================================================
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DiscountQueryService {

    private final DiscountLogRepository discountLogRepository;

    /** ✅ 사용자의 미사용 쿠폰 중 "상품 할인" 전용 쿠폰만 반환 */
    public List<DiscountLog> validProductCoupons(Long uId) {
        return discountLogRepository.findByUsers_uIdAndIsUsedFalse(uId).stream()
                .filter(dl -> isValidNow(dl, DiscountType.PRODUCT_DISCOUNT, null))
                .toList();
    }

    /** ✅ 사용자의 미사용 쿠폰 중 "회원권 할인" 전용 쿠폰만 반환 */
    public List<DiscountLog> validMembershipCoupons(Long uId) {
        return discountLogRepository.findByUsers_uIdAndIsUsedFalse(uId).stream()
                .filter(dl -> isValidNow(dl, DiscountType.MEMBERSHIP_DISCOUNT, null))
                .toList();
    }

    /** ✅ 특정 쿠폰 1장이 지금 조건(type, 기간, 최소금액)에 맞는지 확인 */
    public Optional<DiscountLog> findOwnedForType(Long uId, Long recDisId,
                                                  DiscountType type,
                                                  @Nullable BigDecimal threshold) {
        return discountLogRepository.findByUsers_uIdAndRecDisId(uId, recDisId)
                .filter(dl -> isValidNow(dl, type, threshold));
    }

    /** ✅ 실제 할인 금액 계산 (정액, 정률 모두 지원) */
    public BigDecimal computeCouponAmount(DiscountService ds, BigDecimal base) {
        if (base == null || base.signum() <= 0) return BigDecimal.ZERO;

        BigDecimal amount = BigDecimal.ZERO;

        // ▪ 정액 할인 (예: 5,000원 할인)
        if (ds.getDisPrice() != null && ds.getDisPrice() > 0) {
            amount = BigDecimal.valueOf(ds.getDisPrice());
        }
        // ▪ 정률 할인 (예: 10% 할인)
        else if (ds.getDisPercent() != null && ds.getDisPercent() > 0) {
            amount = base
                    .multiply(BigDecimal.valueOf(ds.getDisPercent()))
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
        }

        // ▪ 할인금액이 상품금액을 초과하지 않도록 제한
        if (amount.compareTo(base) > 0) amount = base;

        // ▪ 음수 방지
        if (amount.signum() < 0) amount = BigDecimal.ZERO;

        return amount;
    }

    /** ✅ 결제 완료 후 해당 쿠폰을 '사용 완료' 상태로 표시 */
    @Transactional
    public void markUsed(Long uId, Long recDisId) {
        discountLogRepository.markUsed(uId, recDisId);
    }

    // ---------------------------------------------------------
    // 🔸 쿠폰 유효성 검사 (내부에서만 사용)
    //    - 이미 사용한 쿠폰인지
    //    - 타입이 맞는지 (상품/회원권)
    //    - 쿠폰이 활성 상태인지
    //    - 기간이 유효한지
    //    - 최소 결제 금액을 충족하는지 확인
    // ---------------------------------------------------------
    private boolean isValidNow(DiscountLog dl, DiscountType type, @Nullable BigDecimal threshold) {
        if (dl == null || dl.getDiscountService() == null) return false;       // 쿠폰 정보가 없으면 무효
        if (Boolean.TRUE.equals(dl.getIsUsed())) return false;                 // 이미 사용된 쿠폰 제외

        var ds = dl.getDiscountService();
        if (ds.getDisType() != type) return false;                             // 쿠폰 종류 불일치 (상품 vs 회원권)
        if (Boolean.FALSE.equals(ds.getIsActive())) return false;              // 비활성 상태면 사용 불가

        LocalDateTime now = LocalDateTime.now();
        if (ds.getDisStartDate() != null && ds.getDisStartDate().isAfter(now)) return false; // 아직 시작 전
        if (ds.getDisEndDate() != null && ds.getDisEndDate().isBefore(now)) return false;   // 이미 종료됨

        // 최소금액(threshold)이 설정되어 있을 때 조건 미달이면 제외
        if (threshold != null && ds.getDisThresholdAmount() != null) {
            if (threshold.compareTo(BigDecimal.valueOf(ds.getDisThresholdAmount())) < 0) {
                return false;
            }
        }
        return true; // 모든 조건을 통과하면 사용 가능
    }
}
