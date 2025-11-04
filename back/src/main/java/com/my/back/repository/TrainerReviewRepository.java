package com.my.back.repository;

import com.my.back.entity.TrainerReview;
import com.my.back.repository.projection.TrainerReviewStats;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TrainerReviewRepository extends JpaRepository<TrainerReview, Long> {

    /**
     * 트레이너별 리뷰 목록 조회.
     * reviewer 연관 엔티티를 즉시 로딩하여 N+1 문제를 방지한다.
     */
    @EntityGraph(attributePaths = "reviewer")
    Page<TrainerReview> findBytId(Long tId, Pageable pageable);

    /**
     * 리뷰 단건 조회.
     * reviewer 정보를 함께 가져와 DTO 변환 시 추가 조회를 막는다.
     */
    @EntityGraph(attributePaths = "reviewer")
    Optional<TrainerReview> findByrId(Long rId);

    /**
     * 특정 트레이너의 리뷰 개수.
     */
    long countBytId(Long tId);

    /**
     * 여러 트레이너의 리뷰 통계를 한 번에 계산.
     * <p>
     * 목록 화면에서 각 트레이너별 평균/카운트를 계산하기 위해 사용한다.
     */
    @Query("SELECT r.tId AS trainerId, AVG(r.rating) AS averageRating, COUNT(r) AS reviewCount " +
            "FROM TrainerReview r WHERE r.tId IN :trainerIds GROUP BY r.tId")
    List<TrainerReviewStats> fetchStatsByTrainerIds(@Param("trainerIds") Collection<Long> trainerIds);

    /**
     * 단일 트레이너의 평균 평점.
     * 상세 화면에서 통계를 미리 조회하지 못한 경우 대비.
     */
    @Query("SELECT AVG(r.rating) FROM TrainerReview r WHERE r.tId = :trainerId")
    Double getAverageRating(@Param("trainerId") Long trainerId);
}