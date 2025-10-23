package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_media")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductMedia {

    /**
     * 미디어키 (PK, auto create)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prod_m_id", nullable = false)
    private Long prodMId;

    /**
     * 상품번호 (not null)
     */
    @Column(name = "prod_id", nullable = false)
    private Long prodId;

    /**
     * 사진 url (not null)
     */
    @Column(name = "prod_url", nullable = false, length = 500)
    private String prodUrl;

    /**
     * 사진텍스트 (nullable)
     */
    @Column(name = "alt_text", length = 200)
    private String altText;

    /**
     * 정렬번호 (default 0)
     */
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    /**
     * 메인사진여부 (default false)
     */
    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;

    // === 관계 매핑 (LAZY) ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prod_id", insertable = false, updatable = false)
    private Products products;
}