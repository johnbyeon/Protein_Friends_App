package com.my.back.dto.food;

import java.util.List;

/**
 * 📌 음식 섭취량 기반 자동 영양 계산 DTO 모음
 *
 * - 클라이언트가 선택한 음식(foodId) + 섭취량(grams)을 전달하면
 * - 서버가 DB 기준으로 비율 계산해서 (grams / serving)
 * - 칼로리 및 탄단지 총합 반환
 */
public class CalorieCalcDtos {

    /**
     * ✅ 사용자 입력 DTO: 어떤 음식(foodId)을 몇 g 섭취했는지
     * 예: (foodId=3, grams=150)
     */
    public record FoodItem(
            Long foodId,
            Long grams
    ) {}

    /**
     * ✅ 요청 DTO: 여러 음식 리스트 한 번에 계산
     * 예:
     * items = [ (닭가슴살 200g), (고구마 150g) ]
     */
    public record CalcRequest(
            List<FoodItem> items
    ) {}

    /**
     * ✅ 응답 DTO: 총합 칼로리/탄단지 결과
     * 예:
     * calories=350, carb=40, protein=50, fat=3
     */
    public record CalcResponse(
            double calories,
            double carbohydrate,
            double protein,
            double fat
    ) {}
}
