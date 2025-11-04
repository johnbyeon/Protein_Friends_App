package com.my.back.repository;

import com.my.back.entity.GymInfo;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 지점명까지 응답에 포함하고 싶을 때 사용 (없어도 기능 동작엔 지장 없음)
 */
public interface GymInfoRepository extends JpaRepository<GymInfo, Long> { }
