package com.my.back.repository;

import com.my.back.entity.GymStationInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 지점 주변 역 정보 Repository
 */
public interface GymStationInfoRepository extends JpaRepository<GymStationInfo, Long> {

    /**
     * 특정 지점의 주변 역 정보 조회
     *
     * @param gId 지점 번호
     * @return 주변 역 정보 목록
     */
    @Query(value = "SELECT * FROM gym_station_info WHERE g_id = :gId", nativeQuery = true)
    List<GymStationInfo> findByGId(@Param("gId") Long gId);
}
