package com.my.back.repository.projection;

import java.time.LocalDateTime;

/**
 * 지점 리뷰 목록 조회 Projection
 * - 닉네임/이메일 + 평점 + 내용 + 작성일
 * - 리뷰 리스트 조회에 사용
 */
public record GymReviewView(
        Long uId,
        String userNickname, // 리뷰 작성자 이름 (없으면 이메일)
        int gRating,         // 평점 (1~5)
        String gReview,      // 리뷰 내용
        LocalDateTime createdAt // 작성일시
) { }
