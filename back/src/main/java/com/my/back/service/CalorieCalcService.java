package com.my.back.service;

import com.my.back.dto.food.CalorieCalcDtos;
import com.my.back.entity.Calorie;
import com.my.back.repository.CalorieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 📌 음식 섭취량(grams) 기반 칼로리 & 탄단지 계산 Service
 *
 * 처리 방식:
 * - 프론트에서 "foodId + grams" 전달
 * - DB에서 해당 음식 영양 정보 조회
 * - 비율 계산: (입력 g / 1회 제공량 g) * 영양소 값
 * - 모든 음식 더해서 결과 반환
 *
 * 이유:
 * - 중복 로직 방지
 * - DB 수치가 바뀌어도 서버 계산 유지 가능
 */
@Service
@RequiredArgsConstructor
public class CalorieCalcService {

    private final CalorieRepository calorieRepository;

    public CalorieCalcDtos.CalcResponse calc(CalorieCalcDtos.CalcRequest req) {

        double totalCal = 0;
        double totalCarb = 0;
        double totalProtein = 0;
        double totalFat = 0;

        // 요청으로 받은 음식들 반복 처리
        for (CalorieCalcDtos.FoodItem item : req.items()) {

            // 음식 DB 조회
            Calorie food = calorieRepository.findById(item.foodId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 음식 ID: " + item.foodId()));

            // 먹은 양(g) / 기준 서빙(g)
            double ratio = item.grams() / (double) food.getServing();

            // 각 영양소 계산 = 비율 * DB 값
            totalCal     += ratio * food.getCalorie();
            totalCarb    += ratio * food.getCarbohydrate();
            totalProtein += ratio * food.getProtein();
            totalFat     += ratio * food.getFat();
        }

        // 총합 결과 반환 (소수점 1자리 반올림)
        return new CalorieCalcDtos.CalcResponse(
                round(totalCal),
                round(totalCarb),
                round(totalProtein),
                round(totalFat)
        );
    }

    private double round(double v) {
        return Math.round(v * 10) / 10.0;
    }
}
