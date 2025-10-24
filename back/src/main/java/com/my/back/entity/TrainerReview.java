package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

/**
 * 트레이너 리뷰 테이블 (7. trainer_review)
 * - 컬럼명/제약/타입 100% 문서 준수
 * - r_id: auto increment PK
 */
@Entity
@Table(name = "trainer_review")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainerReview {

    /**
     * 리뷰 고유번호 (PK, auto increment)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "r_id")
    private Long rId;

    /**
     * 리뷰 작성자 ID (not null)
     * - user.u_id 참조
     */
    @Column(name = "u_id", nullable = false)
    private Long uId;

    /**
     * 리뷰 대상 트레이너 ID (not null)
     * - trainer_info.t_id 참조
     */
    @Column(name = "t_id", nullable = false)
    private Long tId;

    /**
     * 평점 (not null)
     * - 1 ~ 5
     */
    @Column(nullable = false)
    private Integer rating;

    /**
     * 리뷰 내용 (nullable)
     * - 최대 1000자
     */
    @Column(name = "review_text", length = 1000)
    private String reviewText;

    /**
     * 작성일시 (not null, 자동 생성)
     */
    @CreatedDate
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;

    // === 관계 매핑 (LAZY) ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", insertable = false, updatable = false)
    private Users reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t_id", insertable = false, updatable = false)
    private TrainerInfo trainer;
}