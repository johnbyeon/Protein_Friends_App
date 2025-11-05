package com.my.back.controller;

import com.my.back.dto.food.CalorieResponseDto;
import com.my.back.service.CalorieService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/food")
public class CalorieController {

    private final CalorieService service;

    @GetMapping
    public List<CalorieResponseDto> findAll() {
        return service.findAllFoods();
    }

    @GetMapping("/search")
    public List<CalorieResponseDto> search(@RequestParam String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("검색어가 필요합니다.");
        }
        return service.searchFood(name);
    }
}
