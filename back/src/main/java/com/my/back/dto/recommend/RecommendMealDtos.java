package com.my.back.dto.recommend;

import java.time.LocalDate;
import java.util.List;

public class RecommendMealDtos {

    /** 추천 식단 상세 DTO */
    public record RecommendMealLogDTO(
            Long id,
            String food,
            Integer kcal,
            String pic,
            String mealType
    ) { }

    /** 추천 식단 생성 요청 */
    public record CreateReq(
            Long userId,
            Long trainerId,
            LocalDate date,
            List<RecommendMealLogDTO> logs
    ) { }

    /** 추천 식단 수정 요청 */
    public record UpdateReq(
            LocalDate date,
            List<RecommendMealLogDTO> logs
    ) { }

    /** 추천 식단 응답 */
    public record Res(
            Long id,
            Long userId,
            Long trainerId,
            LocalDate date,
            List<RecommendMealLogDTO> logs
    ) { }
}
