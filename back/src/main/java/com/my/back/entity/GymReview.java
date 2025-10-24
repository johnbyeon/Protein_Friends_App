package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

/**
 * 지점 리뷰 테이블 (11_3. gym_review)
 * - 컬럼명/제약/타입 100% 문서 준수 + created_at 추가
 * - 복합키: g_id + u_id
 */
@Entity
@Table(name = "gym_review")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(GymReviewId.class)
public class GymReview {

    /**
     * 지점번호 (복합키 일부, not null)
     */
    @Id
    @Column(name = "g_id", nullable = false)
    private Long gId;

    /**
     * 유저번호 (복합키 일부, not null)
     */
    @Id
    @Column(name = "u_id", nullable = false)
    private Long uId;

    /**
     * 리뷰점수 (default 5)
     */
    @Column(name = "g_rating")
    @Builder.Default
    private Integer gRating = 5;

    /**
     * 리뷰내용 (not null)
     */
    @Column(name = "g_review", nullable = false, length = 1000)
    private String gReview;

    /**
     * 리뷰 작성일시 (자동 생성, not null)
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // === 관계 매핑 (LAZY) ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "g_id", insertable = false, updatable = false)
    private GymInfo gymInfo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", insertable = false, updatable = false)
    private Users reviewer;
}