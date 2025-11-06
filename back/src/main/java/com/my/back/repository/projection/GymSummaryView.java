package com.my.back.repository.projection;

/**
 * 지점 목록 조회 Projection
 * - 메인 페이지/검색 결과용
 * - 리뷰 통계 & 트레이너 수 포함
 */
public record GymSummaryView(
        Long gId,          // 지점 ID
        String gName,      // 지점명
        String gAddress,   // 주소
        String gImageUrl,  // 대표 이미지
        double reviewAvg,  // 리뷰 평균
        long reviewCount,  // 리뷰 개수
        long trainerCount  // 지점 트레이너 수
) { }
