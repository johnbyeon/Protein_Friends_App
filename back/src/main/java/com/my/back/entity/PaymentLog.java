package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

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
@Getter
@Setter
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

    /** 결제 완료 시점 (자동 생성) */
    @CreationTimestamp
    @Column(name = "payment_time", nullable = false, updatable = false)
    private LocalDateTime paymentTime;

    /** 영수증 URL (nullable) */
    @Column(name = "receipt_url", length = 500)
    private String receiptUrl;

    /** 결제 상태 (not null, default DONE) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.DONE;

    /** 회원 정보 (N:1 관계) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", nullable = false) // FK
    private Users users;
}