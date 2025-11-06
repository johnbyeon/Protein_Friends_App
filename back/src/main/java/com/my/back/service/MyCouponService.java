package com.my.back.service;

import com.my.back.dto.CouponCardDto;
import com.my.back.dto.CouponStatus;
import com.my.back.entity.DiscountLog;
import com.my.back.entity.DiscountService;
import com.my.back.entity.DiscountType;
import com.my.back.repository.DiscountLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 내 쿠폰 목록 조회 서비스 (S3 연동 없이, null-safe 기본 이미지 버전)
 */
@Service
@RequiredArgsConstructor
public class MyCouponService {

    // 기본 쿠폰 이미지 (dis_pic_url이 null일 때 대체 이미지)
    private static final String DEFAULT_COUPON_IMG =
            "https://via.placeholder.com/96x96?text=Coupon";

    private final DiscountLogRepository discountLogRepository;

    /** 유저 ID 기준 쿠폰 목록 조회 */
    public List<CouponCardDto> getMyCoupons(Long userId) {

        List<DiscountLog> logs = discountLogRepository.findByUsers_uId(userId);

        return logs.stream().map(log -> {
            DiscountService s = log.getDiscountService();

            // null-safe 처리
            String disName = (s != null) ? s.getDisName() : "";
            Integer disPercent = (s != null && s.getDisPercent() != null) ? s.getDisPercent() : 0;
            Integer disPrice = (s != null && s.getDisPrice() != null) ? s.getDisPrice() : 0;
            Integer threshold = (s != null && s.getDisThresholdAmount() != null) ? s.getDisThresholdAmount() : 0;
            LocalDateTime startAt = (s != null) ? s.getDisStartDate() : null;
            LocalDateTime endAt = (s != null) ? s.getDisEndDate() : null;

            // ✅ dis_pic_url이 null일 때 기본 이미지로 대체
            String thumbnailUrl = (s != null && s.getDisPicUrl() != null && !s.getDisPicUrl().isBlank())
                    ? s.getDisPicUrl()
                    : DEFAULT_COUPON_IMG;

            // 배지 라벨 (Enum → 한글)
            String badge = mapBadge((s != null) ? s.getDisType() : null);

            // 상태 계산
            CouponStatus status = calcStatus(log.getIsUsed(), startAt, endAt);

            // D-Day 계산
            String dday = calcDday(startAt, endAt, status);

            // 할인 표시값
            String displayValue = (disPercent > 0)
                    ? disPercent + "%"
                    : "₩" + String.format("%,d", disPrice);

            // DTO 조립
            return CouponCardDto.builder()
                    .recDisId(log.getRecDisId())
                    .code("#" + String.format("%06d", log.getRecDisId()))
                    .title(disName)
                    .badge(badge)
                    .thumbnailUrl(thumbnailUrl)
                    .discountPercent(disPercent)
                    .discountAmount(disPrice)
                    .minThreshold(threshold)
                    .startAt(startAt)
                    .endAt(endAt)
                    .dday(dday)
                    .status(status)
                    .disabled(status == CouponStatus.EXPIRED || status == CouponStatus.USED)
                    .displayValue(displayValue)
                    .build();
        }).collect(Collectors.toList());
    }

    /** 쿠폰 상태 계산 */
    private CouponStatus calcStatus(Boolean isUsed, LocalDateTime startAt, LocalDateTime endAt) {
        if (Boolean.TRUE.equals(isUsed)) return CouponStatus.USED;
        LocalDateTime now = LocalDateTime.now();
        if (startAt != null && now.isBefore(startAt)) return CouponStatus.UPCOMING;
        if (endAt != null && now.isAfter(endAt)) return CouponStatus.EXPIRED;
        return CouponStatus.ACTIVE;
    }

    /** D-day 계산 */
    private String calcDday(LocalDateTime startAt, LocalDateTime endAt, CouponStatus status) {
        if (status == CouponStatus.UPCOMING) return "시작 전";
        if (status == CouponStatus.USED) return "사용 완료";
        if (status == CouponStatus.EXPIRED) return "만료";

        if (endAt != null) {
            long days = ChronoUnit.DAYS.between(LocalDateTime.now().toLocalDate(), endAt.toLocalDate());
            if (days > 0) return "D-" + days;
            if (days == 0) return "D-Day";
            return "D+" + Math.abs(days);
        }
        return "";
    }

    /** Enum → UI 뱃지 변환 */
    private String mapBadge(DiscountType type) {
        if (type == null) return "";
        return switch (type) {
            case PT_DISCOUNT -> "PT";
            case MEMBERSHIP_DISCOUNT -> "멤버십";
            case PRODUCT_DISCOUNT -> "마켓";
        };
    }
}
