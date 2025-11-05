package com.my.back.service;

import com.my.back.dto.food.CalorieResponseDto;
import com.my.back.entity.Calorie;
import com.my.back.repository.CalorieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CalorieService {

    private final CalorieRepository repo;

    public List<CalorieResponseDto> searchFood(String keyword) {
        return repo.findByFoodNameContaining(keyword)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<CalorieResponseDto> findAllFoods() {
        return repo.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    private CalorieResponseDto toDto(Calorie c) {
        return CalorieResponseDto.builder()
                .foodId(c.getFoodId())
                .foodName(c.getFoodName())
                .serving(c.getServing())
                .calorie(c.getCalorie())
                .carbohydrate(c.getCarbohydrate())
                .protein(c.getProtein())
                .fat(c.getFat())
                .category(c.getCategory())
                .build();
    }
}
