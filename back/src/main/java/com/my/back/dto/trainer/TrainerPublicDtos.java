package com.my.back.dto.trainer;

/**
 * 회원용 트레이너 조회 DTO 모음
 */
public class TrainerPublicDtos {

    /**
     * 트레이너 목록 응답 요약.
     * <p>
     * 지점/평점 정보까지 담아서 한 번의 호출로 UI를 구성할 수 있다.
     */
    public record SummaryRes(
            Long tId,
            String tName,
            String tImageUrl,
            String gymName,
            String tAwardTitle,
            Double averageRating,
            Long reviewCount
    ) { }

    /**
     * 트레이너 상세 응답.
     * <p>
     * 기본 프로필 + 소개/수상/연락처 + 리뷰 통계를 포함한다.
     */
    public record DetailRes(
            Long tId,
            Long gId,
            String tName,
            String tImageUrl,
            String gymName,
            String tPhoneNumber,
            String tAwardTitle,
            String tAboutMe,
            Double averageRating,
            Long reviewCount
    ) { }
}