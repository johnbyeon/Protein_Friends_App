package com.my.back.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * 할인권 카드 DTO
 * - 한 장의 쿠폰 정보를 UI 표시용으로 변환한 데이터 구조
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CouponCardDto {

    private Long recDisId;             // 발급번호 (원본 키)
    private String code;               // "#000123" 같이 UI용 표시 코드
    private String title;              // 할인권 이름
    private String badge;              // 구분 배지 ("PT" | "멤버십" | "마켓")
    private String thumbnailUrl;       // 썸네일 이미지 URL

    private Integer discountPercent;   // 정률 할인 (%) (0이면 미표시)
    private Integer discountAmount;    // 정액 할인 (₩ 단위, 0이면 미표시)
    private Integer minThreshold;      // 최소 사용 금액 (₩)

    private LocalDateTime startAt;     // 시작일시
    private LocalDateTime endAt;       // 종료일시
    private String dday;               // "D-30" | "D-Day" | "D+3" | "시작 전" 등 표시용 문자열

    private CouponStatus status;       // 쿠폰 상태 (ACTIVE | UPCOMING | EXPIRED | USED)
    private Boolean disabled;          // 비활성 상태 (만료 또는 사용완료 시 true)
    private String displayValue;       // 표시 값 (예: "50%", "₩10,000", "1+1")
}
