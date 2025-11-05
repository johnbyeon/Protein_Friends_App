package com.my.back.repository;

import com.my.back.entity.AccessDirection;
import com.my.back.entity.AccessLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * 출입 로그 Repository
 */
public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {


    Optional<AccessLog> findTop1ByuIdOrderByAccessTimeDesc(Long uId);
    /**
     * 특정 지점의 현재 인원 계산
     * (IN 카운트 - OUT 카운트)
     */
    @Query("SELECT (COUNT(a) FILTER (WHERE a.accessDirection = 'IN') - " +
           "COUNT(a) FILTER (WHERE a.accessDirection = 'OUT')) " +
           "FROM AccessLog a WHERE a.gId = :gId")
    Integer getCurrentCapacity(@Param("gId") Long gId);

    /**
     * 특정 회원의 특정 지점에서의 마지막 출입 기록 조회
     * (현재 입장 중인지 확인용)
     */
    @Query(value = "SELECT * FROM access_log WHERE u_id = :uId AND g_id = :gId ORDER BY access_time DESC LIMIT 1", nativeQuery = true)
    Optional<AccessLog> findTop1ByUIdAndGIdOrderByAccessTimeDesc(@Param("uId") Long uId, @Param("gId") Long gId);

    /**
     * 특정 지점의 IN 카운트
     */
    @Query("SELECT COUNT(a) FROM AccessLog a WHERE a.gId = :gId AND a.accessDirection = :direction")
    Long countByGIdAndAccessDirection(@Param("gId") Long gId, @Param("direction") AccessDirection direction);
}
