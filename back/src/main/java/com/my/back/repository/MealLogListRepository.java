package com.my.back.repository;

import com.my.back.entity.MealLogList;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

/**
 * 식단 상세 항목 Repository
 */
public interface MealLogListRepository extends JpaRepository<MealLogList, Long> {

    // record_id로 상세 항목 조회
    List<MealLogList> findByMealLog_RecordId(Long recordId);
    void deleteByMealLog_RecordId(Long recordId); // ✅ 삭제에 필요
    Optional<MealLogList> findById(Long id);

}
