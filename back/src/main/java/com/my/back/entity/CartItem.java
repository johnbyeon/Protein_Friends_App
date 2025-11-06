// src/main/java/com/my/back/entity/CartItem.java
package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 장바구니 라인(유저-상품 관계 + 수량/선택/쿠폰 상태)
 * - 유니크: (u_id, prod_id) 한 유저가 같은 상품은 1줄만
 */
@Entity
@Table(
        name = "cart_item",
        uniqueConstraints = @UniqueConstraint(name = "uk_cart_user_product", columnNames = {"u_id", "prod_id"})
)
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CartItem {

    /** 장바구니 라인 PK */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id", nullable = false)
    private Long cartId;

    /** 유저 FK (user.u_id) */
    @Column(name = "u_id", nullable = false)
    private Long uId;

    /** 상품 FK (products.prod_id) */
    @Column(name = "prod_id", nullable = false)
    private Long prodId;

    /** 담은 수량 */
    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    /** 선택(체크박스) */
    @Column(name = "selected", nullable = false)
    @Builder.Default
    private Boolean selected = true;

    /** 적용 쿠폰(보유 할인권 로그 PK: discount_log.rec_dis_id), null=미적용 */
    @Column(name = "applied_rec_dis_id")
    private Long appliedRecDisId;

    /** 생성/수정 시간(Auditing) */
    @CreatedDate
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;

    @LastModifiedDate
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;

    // 성능/의존성 최소화를 위해 연관관계는 생략(필요 시 LAZY ManyToOne 추가 가능)
}
