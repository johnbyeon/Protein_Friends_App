package com.my.back.repository;

import com.my.back.entity.InbodyUrl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 인바디 URL 데이터 접근 레이어
 */
@Repository
public interface InbodyUrlRepository extends JpaRepository<InbodyUrl, Long> {

    /**
     * 사용자 ID로 인바디 데이터 조회 (최신순)
     * @param userId 사용자 ID
     * @return 인바디 URL 목록
     */
    @Query(value = "SELECT * FROM inbody_url WHERE u_id = :userId ORDER BY create_date DESC", nativeQuery = true)
    List<InbodyUrl> findByUsers_UIdOrderByCreateDateDesc(@Param("userId") Long userId);
}