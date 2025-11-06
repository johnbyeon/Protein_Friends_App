package com.my.back.service;

import com.my.back.entity.PtInfo;
import com.my.back.entity.TrainerInfo;
import com.my.back.entity.Users;
import com.my.back.exception.ApiException;
import com.my.back.exception.ErrorCode;
import com.my.back.repository.PtInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PtInfoService {

    private final PtInfoRepository ptInfoRepository;

    /** ✅ 회원의 사용 가능한 PT 이용권 조회 */
    public List<PtInfo> getAvailableTickets(Long userId, Long trainerId) {
        return ptInfoRepository.findAvailableTickets(userId, trainerId);
    }

    /** ✅ 잔여 횟수 충분한 PT 이용권 1개 찾기 (예약 시 사용) */
    public PtInfo findEligibleTicket(Users user, TrainerInfo trainer, int needCount) {
        return ptInfoRepository.findAvailableTickets(user.getUId(), trainer.getTId())
                .stream()
                .filter(i -> i.getRemainingCount() >= needCount)
                .findFirst()
                .orElseThrow(() -> new ApiException(ErrorCode.PT_TICKET_NOT_FOUND));
    }

    /** ✅ PT 1회 차감 */
    @Transactional
    public void usePt(PtInfo ptInfo, int count) {
        if (ptInfo.getRemainingCount() < count)
            throw new ApiException(ErrorCode.INSUFFICIENT_PT_COUNT);
        ptInfo.setRemainingCount(ptInfo.getRemainingCount() - count);
    }

    /** ✅ PT 복구 (취소 시) */
    @Transactional
    public void restorePt(PtInfo ptInfo, int count) {
        ptInfo.setRemainingCount(ptInfo.getRemainingCount() + count);
    }

    /** ✅ 가장 최근 이용권 (복구용) */
    public PtInfo findLatestTicketForRestore(Long userId, TrainerInfo trainer) {
        return ptInfoRepository.findTicketsForRestore(userId, trainer.getTId())
                .stream()
                .findFirst()
                .orElseThrow(() -> new ApiException(ErrorCode.PT_TICKET_RESTORE_NOT_FOUND));
    }
}
