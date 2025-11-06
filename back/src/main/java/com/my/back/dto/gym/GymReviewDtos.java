package com.my.back.dto.gym;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * 지점 리뷰 전용 DTO 묶음
 */
public class GymReviewDtos {

    /** 지점 리뷰 목록 DTO */
    public record GymReviewItem(
            Long userId,
            String userNickname,
            int gRating,
            String gReview,
            LocalDateTime createdAt
    ) { }

    /** 지점 리뷰 작성 요청 DTO */
    public record CreateGymReviewReq(
            @Min(1) @Max(5)
            int gRating, // 1~5 별점
            @NotBlank @Size(min = 10)
            String gReview // 최소 10자
    ) { }
}
