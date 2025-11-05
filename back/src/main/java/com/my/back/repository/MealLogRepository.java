package com.my.back.repository;

import com.my.back.entity.MealLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * 식단 메인 테이블 Repository
 */
public interface MealLogRepository extends JpaRepository<MealLog, Long> {

    // 특정 유저의 전체 식단 조회
    List<MealLog> findByUsers_uId(Long uId);
}
