package com.my.back.service;

import com.my.back.dto.ptclass.AdminPtClassDtos;
import com.my.back.entity.*;
import com.my.back.exception.ApiException;
import com.my.back.exception.ErrorCode;
import com.my.back.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 관리자용 PT 클래스 서비스 (최종 리팩토링 버전)
 * - 클래스 스케줄 관리
 * - 회원 예약 / 취소
 * - PT 이용권 차감 / 복구
 * - 사용 로그 기록 위임 (PtUsedLogService)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminPtClassService {

    private final PTClassInfoRepository ptClassInfoRepository;
    private final TrainerInfoRepository trainerInfoRepository;
    private final UserRepository userRepository;
    private final ClassUserInfoRepository classUserInfoRepository;

    // ✅ 새로 추가된 서비스 주입
    private final PtInfoService ptInfoService;
    private final PtUsedLogService ptUsedLogService;

    /** 전체 수업 스케줄 조회 */
    public List<AdminPtClassDtos.ScheduleItem> getSchedule() {
        return ptClassInfoRepository.findAllByOrderByStartDatetimeAsc()
                .stream()
                .map(this::toScheduleItem)
                .toList();
    }

    /** 단일 수업 상세 조회 */
    public AdminPtClassDtos.ClassDetail getClassDetail(Long classId) {
        PTClassInfo classInfo = getClassWithTrainer(classId);
        return buildClassDetail(classInfo);
    }

    /** 수업 생성 */
    @Transactional
    public AdminPtClassDtos.ClassDetail createClass(AdminPtClassDtos.CreateClassRequest req) {
        validateSchedule(req.startDatetime(), req.endDatetime());
        TrainerInfo trainer = getTrainer(req.trainerId());

        PTClassInfo saved = ptClassInfoRepository.save(
                PTClassInfo.builder()
                        .className(req.className())
                        .classContent(req.classContent())
                        .trainer(trainer)
                        .startDatetime(req.startDatetime())
                        .endDatetime(req.endDatetime())
                        .maxCapacity(req.maxCapacity())
                        .ptMinusCount(req.ptMinusCount())
                        .build()
        );

        return buildClassDetail(getClassWithTrainer(saved.getPtClassId()));
    }

    /** 수업 수정 */
    @Transactional
    public AdminPtClassDtos.ClassDetail updateClass(Long classId, AdminPtClassDtos.UpdateClassRequest req) {
        PTClassInfo classInfo = getClassWithTrainer(classId);

        if (classInfo.isStarted()) throw new ApiException(ErrorCode.PT_CLASS_ALREADY_STARTED);
        validateSchedule(req.startDatetime(), req.endDatetime());

        long reservedCount = classUserInfoRepository.countByClassId(classId);
        if (req.maxCapacity() < reservedCount)
            throw new ApiException(ErrorCode.INVALID_REQUEST);

        TrainerInfo trainer = getTrainer(req.trainerId());

        classInfo.setClassName(req.className());
        classInfo.setClassContent(req.classContent());
        classInfo.setTrainer(trainer);
        classInfo.setStartDatetime(req.startDatetime());
        classInfo.setEndDatetime(req.endDatetime());
        classInfo.setMaxCapacity(req.maxCapacity());
        classInfo.setPtMinusCount(req.ptMinusCount());

        return buildClassDetail(classInfo);
    }

    /** 회원 예약 추가 (PT 차감 포함) */
    @Transactional
    public AdminPtClassDtos.ClassDetail addUserToClass(Long classId, AdminPtClassDtos.BookingRequest req) {

        PTClassInfo classInfo = getClassWithTrainer(classId);
        Users user = getUser(req.userId());

        if (classInfo.isEnded()) throw new ApiException(ErrorCode.PT_CLASS_ALREADY_ENDED);

        long reserved = classUserInfoRepository.countByClassId(classId);
        if (reserved >= classInfo.getMaxCapacity())
            throw new ApiException(ErrorCode.PT_CLASS_FULL);

        if (classUserInfoRepository.existsByClassIdAndUserId(classId, user.getUId()))
            throw new ApiException(ErrorCode.PT_CLASS_ALREADY_RESERVED);

        // ✅ 이용권 검증 + 차감
        PtInfo ptInfo = ptInfoService.findEligibleTicket(user, classInfo.getTrainer(), classInfo.getPtMinusCount());
        ptInfoService.usePt(ptInfo, classInfo.getPtMinusCount());

        // ✅ 예약 추가
        classUserInfoRepository.insertBooking(classId, user.getUId(), LocalDateTime.now());

        // ✅ 사용 로그 기록
        ptUsedLogService.logUsage(
                user,
                classInfo.getTrainer(),
                classInfo,
                classInfo.getPtMinusCount(),
                ptInfo.getRemainingCount()
        );

        return buildClassDetail(classInfo);
    }

    /** 예약 취소 (PT 복구 포함) */
    @Transactional
    public void removeUserFromClass(Long classId, Long userId) {

        PTClassInfo classInfo = getClassWithTrainer(classId);

        int deleted = classUserInfoRepository.deleteByClassIdAndUserId(classId, userId);
        if (deleted == 0)
            throw new ApiException(ErrorCode.PT_CLASS_RESERVATION_NOT_FOUND);

        // ✅ 복구 처리
        PtInfo ptInfo = ptInfoService.findLatestTicketForRestore(userId, classInfo.getTrainer());
        ptInfoService.restorePt(ptInfo, classInfo.getPtMinusCount());

        // ✅ 사용 로그 취소
        ptUsedLogService.cancelLastUsage(userId, classId);
    }

    // === 내부 유틸 메서드 ===

    private PTClassInfo getClassWithTrainer(Long id) {
        return ptClassInfoRepository.findWithTrainerByPtClassId(id)
                .orElseThrow(() -> new ApiException(ErrorCode.PT_CLASS_NOT_FOUND));
    }

    private TrainerInfo getTrainer(Long id) {
        return trainerInfoRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.TRAINER_NOT_FOUND));
    }

    private Users getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }

    private void validateSchedule(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null || !start.isBefore(end) || start.isBefore(LocalDateTime.now()))
            throw new ApiException(ErrorCode.INVALID_REQUEST);
    }

    private AdminPtClassDtos.ScheduleItem toScheduleItem(PTClassInfo c) {
        long reserved = classUserInfoRepository.countByClassId(c.getPtClassId());
        int capacity = Optional.ofNullable(c.getMaxCapacity()).orElse(0);
        int remaining = Math.max(0, capacity - (int) reserved);

        return new AdminPtClassDtos.ScheduleItem(
                c.getPtClassId(),
                c.getClassName(),
                c.getClassContent(),
                c.getStartDatetime(),
                c.getEndDatetime(),
                c.getMaxCapacity(),
                (int) reserved,
                remaining,
                new AdminPtClassDtos.TrainerSummary(c.getTrainer().getTId(), c.getTrainer().getTName()),
                c.getPtMinusCount()
        );
    }

    private AdminPtClassDtos.ClassDetail buildClassDetail(PTClassInfo c) {
        List<ClassUserInfo> bookings = classUserInfoRepository.findByClassId(c.getPtClassId());
        int reserved = bookings.size();
        int remaining = Math.max(0, c.getMaxCapacity() - reserved);

        return new AdminPtClassDtos.ClassDetail(
                c.getPtClassId(),
                c.getClassName(),
                c.getClassContent(),
                c.getStartDatetime(),
                c.getEndDatetime(),
                c.getMaxCapacity(),
                c.getPtMinusCount(),
                reserved,
                remaining,
                new AdminPtClassDtos.TrainerSummary(c.getTrainer().getTId(), c.getTrainer().getTName()),
                bookings.stream().map(this::toBookedUser).toList()
        );
    }

    private AdminPtClassDtos.BookedUser toBookedUser(ClassUserInfo b) {
        Users u = b.getUsers();
        return new AdminPtClassDtos.BookedUser(
                u.getUId(),
                u.getName(),
                u.getEmail(),
                u.getPhone(),
                b.getDatetime()
        );
    }
}
