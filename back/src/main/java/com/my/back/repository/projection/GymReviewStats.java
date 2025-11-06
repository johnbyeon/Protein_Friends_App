package com.my.back.repository.projection;

/**
 * 지점 리뷰 통계 DTO (Projection)
 * - 리뷰 평균 + 리뷰 개수
 * - 지점 상세 조회 때 사용
 */
public record GymReviewStats(
        double average,  // 평균 평점
        long count       // 리뷰 개수
) { }
