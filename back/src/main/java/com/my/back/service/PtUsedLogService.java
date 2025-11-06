package com.my.back.service;

import com.my.back.entity.PTClassInfo;
import com.my.back.entity.PtUsedLog;
import com.my.back.entity.TrainerInfo;
import com.my.back.entity.Users;
import com.my.back.repository.PtUsedLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PtUsedLogService {

    private final PtUsedLogRepository ptUsedLogRepository;

    /** ✅ 사용 로그 기록 */
    @Transactional
    public void logUsage(Users user, TrainerInfo trainer, PTClassInfo ptClass, int usedCount, int totalCount) {
        PtUsedLog log = PtUsedLog.builder()
                .users(user)
                .trainer(trainer)
                .ptClass(ptClass)
                .usedCount(usedCount)
                .totalCount(totalCount)
                .date(LocalDateTime.now())
                .status(true)
                .build();
        ptUsedLogRepository.save(log);
    }

    /** ✅ 가장 최근 사용 로그 비활성화 (복구 시) */
    @Transactional
    public void cancelLastUsage(Long userId, Long classId) {
        ptUsedLogRepository
                .findTopByUsers_uIdAndPtClass_PtClassIdAndStatusTrueOrderByDateDesc(userId, classId)
                .ifPresent(log -> {
                    log.setStatus(false);
                    ptUsedLogRepository.save(log);
                });
    }
}
