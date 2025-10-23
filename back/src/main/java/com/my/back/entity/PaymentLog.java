package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 결제정보 로그 테이블 (3. payment_log)
 * - 토스페이먼츠 카드 결제 전용
 * - 결제 수단은 카드 고정 → DB 저장 X
 * - status: enum으로 관리
 */
@Entity
@Table(name = "payment_log")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentLog {

    /** 토스페이먼츠 결제 고유키 (PK) */
    @Id
    @Column(name = "payment_key", length = 100)
    private String paymentKey;

    /** 우리 시스템 주문번호 (not null) */
    @Column(name = "order_id", nullable = false, length = 50)
    private String orderId;

    /** 결제 금액 (not null, 원 단위) */
    @Column(nullable = false)
    private BigDecimal amount;

    /** 주문명 (not null) */
    @Column(name = "order_name", nullable = false, length = 200)
    private String orderName;

    /** 구매자 이름 (not null) */
    @Column(name = "customer_name", nullable = false, length = 50)
    private String customerName;

    /** 결제 완료 시점 (not null) */
    @Column(name = "payment_time", nullable = false)
    private LocalDateTime paymentTime;

    /** 영수증 URL (nullable) */
    @Column(name = "receipt_url", length = 500)
    private String receiptUrl;

    /**
     * 결제 상태 (not null, default DONE)
     * - enum: DONE, CANCELED, PARTIAL_CANCELED 등
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.DONE;
}