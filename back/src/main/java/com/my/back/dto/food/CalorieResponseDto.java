package com.my.back.dto.food;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CalorieResponseDto {
    private Long foodId;
    private String foodName;
    private Long serving;          // g
    private Long calorie;          // kcal
    private Long carbohydrate;     // g
    private Long protein;          // g
    private Long fat;              // g
    private String category;       // 음식 카테고리
}