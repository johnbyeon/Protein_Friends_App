package com.my.back.controller;

import com.my.back.dto.food.CalorieCalcDtos;
import com.my.back.service.CalorieCalcService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 📌 칼로리/탄단지 자동 계산 Controller
 *
 * 엔드포인트:
 * POST /api/food/calc
 *
 * 요청: 여러 음식 + 섭취 g
 * 응답: 총 칼로리/탄단지 계산 결과
 *
 * 사용 예:
 * {
 *   "items": [
 *     { "foodId": 1, "grams": 200 },
 *     { "foodId": 3, "grams": 150 }
 *   ]
 * }
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/food")
@CrossOrigin(origins = "*")
public class CalorieCalcController {

    private final CalorieCalcService service;

    @PostMapping("/calc")
    public CalorieCalcDtos.CalcResponse calc(@RequestBody CalorieCalcDtos.CalcRequest req) {
        return service.calc(req);
    }
}
