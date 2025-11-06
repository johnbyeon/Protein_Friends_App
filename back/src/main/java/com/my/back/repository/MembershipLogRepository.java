package com.my.back.repository;

import com.my.back.entity.MembershipLog;
import com.my.back.entity.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ===============================================================
 * ✅ MembershipLogRepository
 * ===============================================================
 * 🔹 역할
 *  - 회원의 전체 회원권 로그 또는 상태별 회원권 조회
 * ---------------------------------------------------------------
 * 🔹 주요 메서드
 *  - findAllByUsers_UIdOrderByCreateDateDesc(Long userId)
 *  - findAllByUsers_UIdAndStatusOrderByCreateDateDesc(Long userId, MembershipStatus status)
 * ===============================================================
 */
@Repository
public interface MembershipLogRepository extends JpaRepository<MembershipLog, Long> {

    /** 회원의 전체 회원권 목록 조회 (최신순) */
    List<MembershipLog> findAllByUsers_uIdOrderByCreateDateDesc(Long userId);

    /** 회원의 상태별 회원권 목록 조회 (예: ACTIVE, EXPIRED 등) */
    List<MembershipLog> findAllByUsers_uIdAndStatusOrderByCreateDateDesc(Long userId, MembershipStatus status);
}
