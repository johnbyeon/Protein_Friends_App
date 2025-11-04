package com.my.back.repository.projection;

/**
 * 트레이너 리뷰 통계 프로젝션.
 * <p>
 * Spring Data JPA 인터페이스 기반 프로젝션으로 JPQL 결과를 DTO 없이 매핑한다.
 */
public interface TrainerReviewStats {
    /** 통계를 계산한 트레이너 PK */
    Long getTrainerId();
    /** 평균 평점 (null 가능) */
    Double getAverageRating();
    /** 리뷰 개수 */
    Long getReviewCount();
}