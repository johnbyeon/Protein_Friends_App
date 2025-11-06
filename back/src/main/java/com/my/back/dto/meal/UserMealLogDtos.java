package com.my.back.dto.meal;

import java.time.LocalDateTime;
import java.util.List;

public class UserMealLogDtos {

    public record MealItemDTO(
            String food,
            Integer kcal,
            String pic,
            String mealType
    ) {}

    public record CreateReq(
            Long uId, // 임시, JWT 붙이면 제거됨
            String mealType,
            LocalDateTime date,
            List<MealItemDTO> mealItems
    ) {}

    public record UpdateReq(
            String mealType,
            LocalDateTime date,
            List<MealItemDTO> mealItems
    ) {}

    public record Res(
            Long recordId,
            Long uId,
            Long tId,
            String mealType,
            LocalDateTime date,
            List<MealItemDTO> mealItems
    ) {}
}
