package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 배송정보 테이블 (6. delivery)
 * - 컬럼명/제약/타입 100% 문서 준수
 * - order_id: purchase_log.order_id와 1:1 매핑
 */
@Entity
@Table(name = "delivery")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delivery {

    /**
     * 주문번호 (PK, not null)
     * - purchase_log.order_id 참조
     * - 예: "ORD-20251023-001"
     */
    @Id
    @Column(name = "order_id", nullable = false, length = 50)
    private String orderId;

    /**
     * 택배사 코드 (not null)
     * - 예: "CJ", "HANJIN", "LOTTE"
     */
    @Column(name = "delivery_code", nullable = false, length = 50)
    private String deliveryCode;

    /**
     * 운송장번호 (not null)
     * - 예: "123456789012"
     */
    @Column(name = "invoice_code", nullable = false, length = 100)
    private String invoiceCode;

    // === 관계 매핑 (LAZY) ===
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId  // orderId 공유
    @JoinColumn(name = "order_id")
    private PurchaseLog purchaseLog;
}