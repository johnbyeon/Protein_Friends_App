package com.my.back.repository;

import com.my.back.entity.GymInfo;
import org.springframework.data.jpa.repository.JpaRepository;

/** 지점(GymInfo) 접근 계층 */
public interface GymInfoRepository extends JpaRepository<GymInfo, Long> { }
