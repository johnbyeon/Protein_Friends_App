package com.my.back.dto.meal;

/**
 * 트레이너가 회원 식단에 코멘트를 남길 때 사용하는 DTO
 */
public record MealTrainerCommentDto(
        String trainerComment
) {}
