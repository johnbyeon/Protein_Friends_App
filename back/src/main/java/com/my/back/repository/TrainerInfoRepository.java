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

import java.util.List;

/**
 * 트레이너 정보 Repository
 */
public interface TrainerInfoRepository extends JpaRepository<TrainerInfo, Long>,JpaSpecificationExecutor<TrainerInfo> {
    boolean existsByuId(Long uId); // ✅ 소문자 u
    /**
     * 특정 지점의 재직 중인 트레이너 목록 조회
     *
     * @param gId 지점 번호
     * @return 트레이너 목록
     */
    @Query(value = "SELECT * FROM trainer_info WHERE g_id = :gId AND t_is_employed = true", nativeQuery = true)
    List<TrainerInfo> findByGIdAndEmployed(@Param("gId") Long gId);
    
  /** 지점에 소속된 트레이너 수 */
    @Query("select count(t) from TrainerInfo t where t.gId = :gId")
    long countByGymId(@Param("gId") Long gId);
}
