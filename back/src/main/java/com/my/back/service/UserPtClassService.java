package com.my.back.service;

import com.my.back.dto.ptclass.UserPtClassDtos;
import com.my.back.entity.*;
import com.my.back.exception.ApiException;
import com.my.back.exception.ErrorCode;
import com.my.back.repository.ClassUserInfoRepository;
import com.my.back.repository.PTClassInfoRepository;
import com.my.back.repository.UserRepository;
import com.my.back.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserPtClassService {

    private final PTClassInfoRepository classRepo;
    private final ClassUserInfoRepository classUserRepo;
    private final UserRepository userRepo;
    private final PtInfoService ptInfoService;
    private final PtUsedLogService ptUsedLogService;
    private final SecurityUtil securityUtil;

    /** ✅ 전체 예약 가능한 클래스 조회 */
    public List<UserPtClassDtos.ClassItem> getAvailableClasses() {
        List<PTClassInfo> list = classRepo.findAvailableClasses();
        return list.stream()
                .map(c -> {
                    long reserved = classUserRepo.countByClassId(c.getPtClassId());
                    int remaining = Math.max(0, c.getMaxCapacity() - (int) reserved);
                    return new UserPtClassDtos.ClassItem(
                            c.getPtClassId(),
                            c.getClassName(),
                            c.getClassContent(),
                            c.getStartDatetime(),
                            c.getEndDatetime(),
                            c.getMaxCapacity(),
                            (int) reserved,
                            remaining,
                            new UserPtClassDtos.TrainerInfo(
                                    c.getTrainer().getTId(),
                                    c.getTrainer().getTName()
                            )
                    );
                })
                .toList();
    }

    /** ✅ 내가 신청한 클래스 목록 조회 */
    public List<UserPtClassDtos.MyClassItem> getMyClasses() {
        Long userId = securityUtil.getLoginUserId();
        List<ClassUserInfo> bookings = classUserRepo.findByUserId(userId);
        return bookings.stream()
                .map(b -> {
                    PTClassInfo c = b.getPtClassInfo();
                    return new UserPtClassDtos.MyClassItem(
                            c.getPtClassId(),
                            c.getClassName(),
                            c.getStartDatetime(),
                            c.getEndDatetime(),
                            new UserPtClassDtos.TrainerInfo(
                                    c.getTrainer().getTId(),
                                    c.getTrainer().getTName()
                            )
                    );
                })
                .toList();
    }

    /** ✅ 회원이 직접 클래스 예약 (PT 차감 포함) */
    @Transactional
    public void reserveClass(Long classId) {
        Long userId = securityUtil.getLoginUserId();
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        PTClassInfo classInfo = classRepo.findWithTrainerByPtClassId(classId)
                .orElseThrow(() -> new ApiException(ErrorCode.PT_CLASS_NOT_FOUND));

        if (classInfo.isEnded())
            throw new ApiException(ErrorCode.PT_CLASS_ALREADY_ENDED);

        long reserved = classUserRepo.countByClassId(classId);
        if (reserved >= classInfo.getMaxCapacity())
            throw new ApiException(ErrorCode.PT_CLASS_FULL);

        if (classUserRepo.existsByClassIdAndUserId(classId, userId))
            throw new ApiException(ErrorCode.PT_CLASS_ALREADY_RESERVED);

        // ✅ 이용권 차감
        PtInfo ptInfo = ptInfoService.findEligibleTicket(user, classInfo.getTrainer(), classInfo.getPtMinusCount());
        ptInfoService.usePt(ptInfo, classInfo.getPtMinusCount());

        // ✅ 예약 저장
        classUserRepo.insertBooking(classId, userId, LocalDateTime.now());

        // ✅ 로그 기록
        ptUsedLogService.logUsage(
                user,
                classInfo.getTrainer(),
                classInfo,
                classInfo.getPtMinusCount(),
                ptInfo.getRemainingCount()
        );
    }

    /** ✅ 회원이 직접 예약 취소 (PT 복구 포함) */
    @Transactional
    public void cancelReservation(Long classId) {
        Long userId = securityUtil.getLoginUserId();

        PTClassInfo classInfo = classRepo.findWithTrainerByPtClassId(classId)
                .orElseThrow(() -> new ApiException(ErrorCode.PT_CLASS_NOT_FOUND));

        int deleted = classUserRepo.deleteByClassIdAndUserId(classId, userId);
        if (deleted == 0)
            throw new ApiException(ErrorCode.PT_CLASS_RESERVATION_NOT_FOUND);

        // ✅ 이용권 복구
        PtInfo ptInfo = ptInfoService.findLatestTicketForRestore(userId, classInfo.getTrainer());
        ptInfoService.restorePt(ptInfo, classInfo.getPtMinusCount());

        // ✅ 로그 취소
        ptUsedLogService.cancelLastUsage(userId, classId);
    }
}
