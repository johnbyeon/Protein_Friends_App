package com.my.back.repository;

import com.my.back.entity.MembershipStopLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ===============================================================
 * ✅ MembershipStopLogRepository
 * ===============================================================
 * 🔹 역할
 *  - 각 회원권에 연결된 정지 이력 목록 조회
 * ---------------------------------------------------------------
 * 🔹 주요 메서드
 *  - findAllByMembershipLog_MLogIdOrderByStopDateDesc(Long mLogId)
 *    → 특정 회원권의 정지 이력을 최신순으로 조회
 * ===============================================================
 */
@Repository
public interface MembershipStopLogRepository extends JpaRepository<MembershipStopLog, Long> {
    List<MembershipStopLog> findAllByMembershipLog_mLogIdOrderByStopDateDesc(Long mLogId);
}
