package com.my.back.dto.review;

import java.time.LocalDateTime;

/**
 * 트레이너 리뷰 DTO 모음
 * - 회원이 남기는 트레이너 리뷰 CRUD 용도
 */
public class ReviewDtos {

    /**
     * 리뷰 생성 요청 DTO.
     * <p>
     * 컨트롤러에서 Json -> DTO 매핑 후 서비스에서 검증한다.
     */
    public record CreateReq(
            Long trainerId,
            Integer rating,
            String reviewText
    ) { }

    /**
     * 리뷰 수정 요청 DTO.
     * <p>
     * 부분 업데이트를 허용하기 위해 null 값은 변경하지 않는다.
     */
    public record UpdateReq(
            Integer rating,
            String reviewText
    ) { }

    /**
     * 리뷰 응답 DTO.
     * <p>
     * 연관된 회원 정보(이름/프로필 이미지)를 함께 반환하여
     * 추가 조회 없이 UI 구성 가능하도록 한다.
     */
    public record Res(
            Long reviewId,
            Long trainerId,
            Long userId,
            String userName,
            String userProfileImage,
            Integer rating,
            String reviewText,
            LocalDateTime createdAt
    ) { }
}