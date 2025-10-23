package com.my.back.entity;

/**
 * 토스페이먼츠 결제 상태
 * - https://docs.tosspayments.com/reference#payment-객체
 */
public enum PaymentStatus {
    /**
     * 결제 완료
     */
    DONE,

    /**
     * 결제 대기 중
     */
    WAITING_FOR_DEPOSIT,

    /**
     * 부분 취소됨
     */
    PARTIAL_CANCELED,

    /**
     * 전체 취소됨
     */
    CANCELED,

    /**
     * 결제 실패
     */
    ABORTED
}
