package com.my.back.repository;

import com.my.back.entity.PTService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * PTService Repository
 * PT 이용권 상품 정보 접근 계층
 */
@Repository
public interface PTServiceRepository extends JpaRepository<PTService, Long> {
    
    /**
     * 활성화된 PT 이용권 목록을 생성일 내림차순으로 조회
     * @return 활성화된 PT 이용권 목록
     */
    List<PTService> findByIsActiveTrueOrderByCreatedAtDesc();
    
    /**
     * 모든 PT 이용권 목록을 생성일 내림차순으로 조회
     * @return 모든 PT 이용권 목록
     */
    List<PTService> findAllByOrderByCreatedAtDesc();
}