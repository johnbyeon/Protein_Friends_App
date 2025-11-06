package com.my.back.dto;

/**
 * 할인권 상태를 나타내는 enum.
 *
 * <ul>
 *   <li>ACTIVE   : 사용 가능 (기간 내, 미사용)</li>
 *   <li>UPCOMING : 시작 전 (시작일 미도래)</li>
 *   <li>EXPIRED  : 만료됨 (종료일 경과, 미사용)</li>
 *   <li>USED     : 사용 완료 (isUsed = true)</li>
 * </ul>
 */
public enum CouponStatus {
    ACTIVE,    // 사용 가능
    UPCOMING,  // 시작 전
    EXPIRED,   // 만료됨
    USED       // 사용 완료
}
