package com.my.back.repository;

import com.my.back.entity.PtUsedLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * PT 사용 로그 Repository
 * - PT 차감 / 복구 확인용
 * - 최근 사용 이력 조회 (중복 차감 방지)
 */
public interface PtUsedLogRepository extends JpaRepository<PtUsedLog, Long> {

    /**
     * 특정 유저가 특정 수업에서 가장 최근에 PT를 사용한 기록 조회
     * - Status = true 의미: 정상 사용 상태
     * - 예약 취소 시 차감 복구 판단에 사용
     */
    Optional<PtUsedLog> findTopByUsers_uIdAndPtClass_PtClassIdAndStatusTrueOrderByDateDesc(
            Long userId, Long classId
    );
}
