package com.my.back.repository;

import com.my.back.entity.TrainerInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * 트레이너 Repository
 * - 트레이너 존재 여부
 * - 지점 트레이너 수 조회
 */
public interface TrainerInfoRepository extends JpaRepository<TrainerInfo, Long>, JpaSpecificationExecutor<TrainerInfo> {

    /** 특정 유저 ID로 등록된 트레이너가 있는지 확인 */
    boolean existsByuId(Long uId);

    /** 지점에 소속된 트레이너 수 */
    @Query("select count(t) from TrainerInfo t where t.gId = :gId")
    long countByGymId(@Param("gId") Long gId);
}
