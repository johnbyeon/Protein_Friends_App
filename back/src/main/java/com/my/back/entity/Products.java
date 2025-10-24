package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Products {

    /** 상품번호 (Primary Key, Auto Increment) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prod_id")
    private Long id;

    /** 상품이름 */
    @Column(name = "prod_name", nullable = false, length = 255)
    private String name;

    /** 상품코드 (Unique) */
    @Column(name = "prod_sku", nullable = false, unique = true, length = 100)
    private String sku;

    /** 상품정상가 */
    @Column(name = "prod_price", nullable = false)
    private Double price;

    /** 상품할인가 */
    @Column(name = "prod_sale_price")
    private Double salePrice;

    /** 재고수량 (기본값 0) */
    @Column(name = "stock_qty", nullable = false)
    private Integer stockQty = 0;

    /** 상품상태 (active / inactive) */
    @Enumerated(EnumType.STRING)
    @Column(name = "prod_status", nullable = false)
    private ProductStatus status = ProductStatus.ACTIVE;

    /** 상품등록일 (자동 기록) */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** 상품수정일 (자동 갱신) */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /** 상품제목 */
    @Column(name = "prod_subtitle", length = 255)
    private String subtitle;

    /** 본문 (HTML 내용 저장) */
    @Lob
    @Column(name = "detail_html", nullable = false)
    private String detailHtml;
}
