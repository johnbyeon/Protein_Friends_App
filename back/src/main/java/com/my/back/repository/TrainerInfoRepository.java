package com.my.back.repository;

import com.my.back.entity.TrainerInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TrainerInfoRepository extends JpaRepository<TrainerInfo, Long>, JpaSpecificationExecutor<TrainerInfo> {
    boolean existsByuId(Long uId); // ✅ 소문자 u
}
