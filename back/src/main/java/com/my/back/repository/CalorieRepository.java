package com.my.back.repository;

import com.my.back.entity.Calorie;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CalorieRepository extends JpaRepository<Calorie, Long> {
    List<Calorie> findByFoodNameContaining(String keyword);
}
