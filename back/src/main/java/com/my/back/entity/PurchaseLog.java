package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.CreatedDate;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 구매내역 로그 테이블 (4. Purchase_log)
 * - 주문 단위 기록 (1건 = 1주문)
 * - order_id: 우리 시스템에서 생성 (PK)
 * - 결제 완료 후 생성
 */
@Entity
@Table(name = "purchase_log")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseLog {

    /**
     * 주문번호 (PK, String)
     * - 서비스에서 생성 (예: "ORD-20251023-001")
     * - auto create → UUID or 시퀀스
     */
    @Id
    @Column(name = "order_id", length = 50)
    private String orderId;

    /**
     * 구매 타입 (not null)
     * - enum: PT, MARKET, MEMBERSHIP
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false)
    private ProductType productType;

    /**
     * 구매 품목 ID (not null)
     * - PT: pt_id, MARKET: prod_id, MEMBERSHIP: membership_id
     */
    @Column(name = "product_id", nullable = false, length = 100)
    private String productId;

    /**
     * 구매 수량 (not null)
     * - PT: 횟수, MARKET: 개수, MEMBERSHIP: 1
     */
    @Column(name = "product_count", nullable = false)
    private Integer productCount;

    /**
     * 원래 가격 (not null)
     * - 할인 전 금액
     */
    @Column(name = "original_price", nullable = false)
    private BigDecimal originalPrice;

    /**
     * 할인 금액 (nullable)
     * - default 0
     */
    @Column(name = "discount_amount")
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    /**
     * 최종 결제 금액 (not null)
     * - original_price - discount_amount
     */
    @Column(name = "final_price", nullable = false)
    private BigDecimal finalPrice;

    /**
     * 주문 일시 (not null, 자동 생성)
     * - 결제 완료 시점
     */
    @CreatedDate
    @Column(name = "order_datetime", nullable = false, updatable = false)
    private LocalDateTime orderDatetime;

    /**
     * 배송 여부 (default true)
     * - MARKET: true, PT/MEMBERSHIP: false
     */
    @Column(name = "is_delivery")
    @Builder.Default
    private Boolean isDelivery = true;

    /**
     * 거래 성사 여부 (default SUCCESS)
     * - 환불 시 CANCELED
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "is_deal", nullable = false)
    @Builder.Default
    private DealStatus dealStatus = DealStatus.SUCCESS;
}