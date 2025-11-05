package com.my.back.repository;

import com.my.back.entity.RecommendMeal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface RecommendMealRepository extends JpaRepository<RecommendMeal, Long> {

    List<RecommendMeal> findByUserId(Long userId);

    List<RecommendMeal> findByTrainerId(Long trainerId);

    List<RecommendMeal> findByUserIdAndDate(Long userId, LocalDate date);
}
