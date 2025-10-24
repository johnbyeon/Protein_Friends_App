package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

/**
 * 마켓품목 리뷰 테이블 (8_1. market_review)
 * - 컬럼명/제약/타입 100% 문서 준수
 * - p_r_id: auto increment PK (사진 매칭용)
 */
@Entity
@Table(name = "market_review")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketReview {

    /**
     * 리뷰 고유번호 (PK, auto increment)
     * - 사진 매칭을 위해 사용
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "p_r_id", nullable = false)
    private Long pRId;

    /**
     * 마켓 품목 번호 (not null)
     * - market_product.p_id 참조 (가정)
     */
    @Column(name = "p_id", nullable = false)
    private Long pId;

    /**
     * 리뷰 작성자 ID (not null)
     * - user.u_id 참조
     */
    @Column(name = "u_id", nullable = false)
    private Long uId;

    /**
     * 마켓 품목 별점 (default 5)
     * - 1 ~ 5
     */
    @Column(name = "p_rating")
    @Builder.Default
    private Integer pRating = 5;

    /**
     * 리뷰 제목 (not null)
     * - 예: "배송 빠르고 좋음"
     */
    @Column(name = "p_review_subtitle", nullable = false, length = 200)
    private String pReviewSubtitle;

    /**
     * 마켓 품목 리뷰 내용 (not null)
     * - 최대 1000자
     */
    @Column(name = "p_review", nullable = false, length = 1000)
    private String pReview;

    /**
     * 리뷰 작성 시간 (nullable, 서비스에서 설정)
     */
    @CreatedDate
    @Column(name = "p_datetime")
    private LocalDateTime pDatetime;

    // === 관계 매핑 (LAZY) ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", insertable = false, updatable = false)
    private Users reviewer;

    // p_id에 대한 관계는 MarketProduct 엔티티가 정의될 때 추가
}