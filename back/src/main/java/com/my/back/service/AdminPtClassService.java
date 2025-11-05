package com.my.back.service;

import com.my.back.dto.ptclass.AdminPtClassDtos;
import com.my.back.entity.*;
import com.my.back.exception.ApiException;
import com.my.back.exception.ErrorCode;
import com.my.back.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 관리자용 PT 클래스 서비스
 * - 수업 스케줄 관리
 * - 수업 생성/수정
 * - 회원 수업 예약 및 취소
 * - PT 횟수 차감/복구 처리
 * - PT 사용 로그 기록
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminPtClassService {

    private final PTClassInfoRepository ptClassInfoRepository;
    private final TrainerInfoRepository trainerInfoRepository;
    private final UserRepository userRepository;
    private final ClassUserInfoRepository classUserInfoRepository;
    private final PtInfoRepository ptInfoRepository;
    private final PtUsedLogRepository ptUsedLogRepository;

    /** 관리자용: 전체 수업 스케줄 조회 */
    public List<AdminPtClassDtos.ScheduleItem> getSchedule() {
        return ptClassInfoRepository.findAllByOrderByStartDatetimeAsc()
                .stream()
                .map(this::toScheduleItem)
                .toList();
    }

    /** 관리자용: 단일 수업 상세 조회 */
    public AdminPtClassDtos.ClassDetail getClassDetail(Long classId) {
        PTClassInfo classInfo = getClassWithTrainer(classId);
        return buildClassDetail(classInfo);
    }

    /** 관리자: 수업 생성 */
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

    /** 관리자: 수업 수정 */
    @Transactional
    public AdminPtClassDtos.ClassDetail updateClass(Long classId, AdminPtClassDtos.UpdateClassRequest req) {

        PTClassInfo classInfo = getClassWithTrainer(classId);

        if (classInfo.getStartDatetime().isBefore(LocalDateTime.now())) {
            throw new ApiException(ErrorCode.PT_CLASS_ALREADY_STARTED);
        }

        validateSchedule(req.startDatetime(), req.endDatetime());

        long reservedCount = classUserInfoRepository.countByClassId(classId);
        if (req.maxCapacity() < reservedCount) {
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

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

    /** 관리자: 수업에 회원 예약 추가 */
    @Transactional
    public AdminPtClassDtos.ClassDetail addUserToClass(Long classId, AdminPtClassDtos.BookingRequest req) {

        PTClassInfo classInfo = getClassWithTrainer(classId);
        Users user = getUser(req.userId());

        if (classInfo.getEndDatetime().isBefore(LocalDateTime.now())) {
            throw new ApiException(ErrorCode.PT_CLASS_ALREADY_ENDED);
        }

        long reserved = classUserInfoRepository.countByClassId(classId);
        if (reserved >= classInfo.getMaxCapacity()) {
            throw new ApiException(ErrorCode.PT_CLASS_FULL);
        }

        if (classUserInfoRepository.existsByClassIdAndUserId(classId, user.getUId())) {
            throw new ApiException(ErrorCode.PT_CLASS_ALREADY_RESERVED);
        }

        PtInfo ptInfo = findEligiblePtInfo(
                user,
                classInfo.getTrainer(),
                classInfo.getPtMinusCount(),
                classInfo.getEndDatetime()
        );

        int minus = classInfo.getPtMinusCount();
        int nowCount = Optional.ofNullable(ptInfo.getPtTotalCount()).orElse(0);
        if (nowCount < minus) {
            throw new ApiException(ErrorCode.INSUFFICIENT_PT_COUNT);
        }

        ptInfo.setPtTotalCount(nowCount - minus);

        classUserInfoRepository.insertBooking(classId, user.getUId(), LocalDateTime.now());

        ptUsedLogRepository.save(
                PtUsedLog.builder()
                        .users(user)
                        .trainer(classInfo.getTrainer())
                        .date(LocalDateTime.now())
                        .totalCount(ptInfo.getPtTotalCount())
                        .usedCount(minus)
                        .status(true)
                        .ptClass(classInfo)
                        .build()
        );

        return buildClassDetail(classInfo);
    }

    /** 관리자: 수업 예약 취소 */
    @Transactional
    public void removeUserFromClass(Long classId, Long userId) {

        PTClassInfo classInfo = getClassWithTrainer(classId);

        int deleted = classUserInfoRepository.deleteByClassIdAndUserId(classId, userId);
        if (deleted == 0) {
            throw new ApiException(ErrorCode.PT_CLASS_RESERVATION_NOT_FOUND);
        }

        int recover = classInfo.getPtMinusCount();
        PtInfo ptInfo = findPtInfoForRestoration(userId, classInfo.getTrainer());

        ptInfo.setPtTotalCount(ptInfo.getPtTotalCount() + recover);

        ptUsedLogRepository
                .findTopByUsers_uIdAndPtClass_PtClassIdAndStatusTrueOrderByDateDesc(userId, classId)
                .ifPresent(log -> {
                    log.setStatus(false);
                    ptUsedLogRepository.save(log);
                });
    }

    /** 수업 + 트레이너 조회 */
    private PTClassInfo getClassWithTrainer(Long id) {
        return ptClassInfoRepository.findWithTrainerByPtClassId(id)
                .orElseThrow(() -> new ApiException(ErrorCode.PT_CLASS_NOT_FOUND));
    }

    /** 트레이너 조회 */
    private TrainerInfo getTrainer(Long id) {
        return trainerInfoRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.TRAINER_NOT_FOUND));
    }

    /** 회원 조회 */
    private Users getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }

    /** 날짜 유효성 검증 */
    private void validateSchedule(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }
        if (!start.isBefore(end)) {
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }
        if (start.isBefore(LocalDateTime.now())) {
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }
    }

    /** 예약 시: 남은 PT가 충분하고 기간 내 이용권 선택 */
    private PtInfo findEligiblePtInfo(Users user, TrainerInfo trainer, Integer minus, LocalDateTime end) {
        int need = Optional.ofNullable(minus).orElse(0);
        if (need <= 0) {
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        LocalDate target = end != null ? end.toLocalDate() : LocalDate.now();

        return ptInfoRepository.findAvailableTickets(user.getUId(), trainer.getTId())
                .stream()
                .filter(i -> i.getPtTotalCount() != null && i.getPtTotalCount() >= need)
                .filter(i -> i.getStartDate() == null || !i.getStartDate().isAfter(target))
                .filter(i -> i.getEndDate() == null || !i.getEndDate().isBefore(target))
                .findFirst()
                .orElseThrow(() -> new ApiException(ErrorCode.PT_TICKET_NOT_FOUND));
    }

    /** 취소 시: 가장 최근 PT 이용권 찾아 복구 */
    private PtInfo findPtInfoForRestoration(Long userId, TrainerInfo trainer) {
        return ptInfoRepository.findTicketsForRestore(userId, trainer.getTId())
                .stream()
                .findFirst()
                .orElseThrow(() -> new ApiException(ErrorCode.PT_TICKET_RESTORE_NOT_FOUND));
    }

    /** 스케줄 DTO 변환 */
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
                toTrainerSummary(c.getTrainer()),
                c.getPtMinusCount()
        );
    }

    /** 상세 DTO 변환 */
    private AdminPtClassDtos.ClassDetail buildClassDetail(PTClassInfo c) {
        List<ClassUserInfo> bookings = classUserInfoRepository.findByClassId(c.getPtClassId());

        int reserved = bookings.size();
        int capacity = Optional.ofNullable(c.getMaxCapacity()).orElse(0);
        int remaining = Math.max(0, capacity - reserved);

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
                toTrainerSummary(c.getTrainer()),
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

    private AdminPtClassDtos.TrainerSummary toTrainerSummary(TrainerInfo t) {
        if (t == null) {
            return new AdminPtClassDtos.TrainerSummary(null, null);
        }
        return new AdminPtClassDtos.TrainerSummary(t.getTId(), t.getTName());
    }
}
