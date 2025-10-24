package com.my.back.entity;

/**
 * 회원권 활성화 상태 Enum
 */
public enum MembershipStatus {
    /** 만료 */
    EXPIRED,

    /** 사용중 */
    ACTIVE,

    /** 정지 */
    PAUSED,

    /** 취소 */
    CANCELED
}
