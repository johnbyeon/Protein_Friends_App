package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 마켓품목 리뷰 사진 테이블 (8_2. market_review_pic)
 * - 컬럼명/제약/타입 100% 문서 패턴 준수
 * - pic_id: auto increment PK
 * - 한 리뷰에 여러 사진 가능 (N:1)
 */
@Entity
@Table(name = "market_review_pic")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketReviewPic {

    /**
     * 사진 고유번호 (PK, auto increment)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pic_id")
    private Long picId;

    /**
     * 리뷰 번호 (not null)
     * - market_review.p_r_id 참조
     */
    @Column(name = "p_r_id", nullable = false)
    private Long pRId;

    /**
     * 사진 URL (not null)
     * - 예: "https://s3.amazonaws.com/review/123.jpg"
     */
    @Column(name = "pic_url", nullable = false, length = 500)
    private String picUrl;

    // === 관계 매핑 (LAZY) ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_r_id", insertable = false, updatable = false)
    private MarketReview marketReview;
}