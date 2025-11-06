package com.my.back.service;

import com.my.back.dto.MembershipCardDto;
import com.my.back.dto.StopLogDto;
import com.my.back.entity.MembershipLog;
import com.my.back.entity.MembershipStatus;
import com.my.back.entity.MembershipStopLog;
import com.my.back.repository.MembershipLogRepository;
import com.my.back.repository.MembershipStopLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * ===============================================================
 * ✅ MyMembershipService — 회원권 관련 비즈니스 로직
 * ===============================================================
 * 🔹 주요 기능
 *   1) 전체 회원권 조회 (최근순)
 *   2) 상태별 회원권 조회 (예: ACTIVE, PAUSED 등)
 *   3) 회원권 + 정지내역(MembershipStopLog) 병합 변환
 *   4) 실제 UI에 표시할 상태 텍스트 계산 (사용 중, 정지 중 등)
 * ===============================================================
 */
@Service
@RequiredArgsConstructor
public class MyMembershipService {

    /** 회원권 로그 (결제/기간 정보) */
    private final MembershipLogRepository logRepo;
    /** 회원권 정지 로그 (정지 내역/사유 기록) */
    private final MembershipStopLogRepository stopRepo;

    // ---------------------------------------------------------
    // ✅ 1. 전체 회원권 조회 (모든 상태 포함)
    // ---------------------------------------------------------
    /**
     * 특정 회원(userId)의 모든 회원권 내역을 최신순으로 조회한다.
     * - 정지 내역 포함
     * - 각 로그를 MembershipCardDto 형태로 변환하여 반환
     */
    public List<MembershipCardDto> getAllMemberships(Long userId) {
        List<MembershipLog> logs = logRepo.findAllByUsers_uIdOrderByCreateDateDesc(userId);
        return logs.stream().map(this::convertToDto).toList();
    }

    // ---------------------------------------------------------
    // ✅ 2. 상태별 회원권 조회 (ACTIVE / EXPIRED / PAUSED / CANCELED)
    // ---------------------------------------------------------
    /**
     * 특정 회원(userId)의 회원권 중 특정 상태(status)에 해당하는 내역만 조회한다.
     * - ex) ACTIVE, EXPIRED, PAUSED 등
     * - 상태 필터링 기능 추가 버전
     */
    public List<MembershipCardDto> getMembershipsByStatus(Long userId, MembershipStatus status) {
        List<MembershipLog> logs = logRepo.findAllByUsers_uIdAndStatusOrderByCreateDateDesc(userId, status);
        return logs.stream().map(this::convertToDto).toList();
    }

    // ---------------------------------------------------------
    // ✅ 3. MembershipLog → MembershipCardDto 변환 로직
    // ---------------------------------------------------------
    /**
     * MembershipLog 엔티티 1건을 MembershipCardDto로 변환한다.
     * - 정지 로그(MembershipStopLog) 조회 및 DTO 매핑
     * - 정지기간(plusDate)만큼 endDate를 보정
     * - 최종적으로 UI용 상태(effective status) 계산
     */
    private MembershipCardDto convertToDto(MembershipLog log) {
        // 🔹 (1) 회원권 정지 내역 조회 및 StopLogDto 리스트로 변환
        List<StopLogDto> stops = stopRepo.findAllByMembershipLog_mLogIdOrderByStopDateDesc(log.getMLogId())
                .stream().map(this::toStopDto).toList();

        // 🔹 (2) 정지일수(plusDate)를 더해 실제 종료일 조정
        LocalDate adjustedEnd = (log.getEndDate() != null)
                ? log.getEndDate().plusDays(stops.stream().mapToInt(StopLogDto::getPlusDate).sum())
                : null;

        // 🔹 (3) 현재 상태 + 날짜기준으로 유효 상태 계산
        MembershipStatus effective = calcStatus(log.getStatus(), log.getStartDate(), adjustedEnd);

        // 🔹 (4) UI 표시용 상태 텍스트로 변환
        String uiStatus = toUiStatus(effective, log.getStartDate());

        // 🔹 (5) 최종 DTO 빌드
        return MembershipCardDto.builder()
                .mLogId(log.getMLogId())                                    // 회원권 ID
                .title(log.getMembershipName())                              // 회원권 이름
                .code("M-" + String.format("%06d", log.getMLogId()))         // UI용 코드 (예: M-000123)
                .status(effective.name())                                    // 실제 상태 (enum 문자열)
                .uiStatus(uiStatus)                                          // UI 표시 상태 (한글)
                .buyDate(log.getCreateDate() != null ? log.getCreateDate().toLocalDate() : null)
                .startDate(log.getStartDate())
                .endDate(adjustedEnd)
                .price(log.getPrice())                                       // 원가
                .discount(log.getSalePrice())                                // 할인 금액
                .finalPrice(log.getPrice() - (log.getSalePrice() != null ? log.getSalePrice() : 0)) // 결제금액
                .stopUsed(stops.size())                                      // 정지 사용 횟수
                .stopLimit(log.getStopCount() != null ? log.getStopCount() : 0) // 정지 제한 횟수
                .stops(stops)                                                // 정지 내역 리스트
                .build();
    }

    // ---------------------------------------------------------
    // ✅ 4. MembershipStopLog → StopLogDto 변환
    // ---------------------------------------------------------
    private StopLogDto toStopDto(MembershipStopLog stop) {
        return StopLogDto.builder()
                .stopLogId(stop.getStopLogId())      // 정지 로그 ID
                .membershipId(stop.getMembershipId()) // 해당 회원권 ID
                .startDate(stop.getStartDate())       // 정지 시작일
                .endDate(stop.getEndDate())           // 정지 종료일
                .stopDate(stop.getStopDate())         // 실제 정지일
                .plusDate(stop.getPlusDate())         // 연장일수 (+일)
                .reasonNote(stop.getReasonNote())     // 정지 사유
                .build();
    }

    // ---------------------------------------------------------
    // ✅ 5. 현재 상태 재계산 로직
    // ---------------------------------------------------------
    /**
     * DB에 저장된 상태와 날짜 조건을 함께 판단하여
     * 실제로 '유효한' 상태를 계산한다.
     *
     * 예)
     * - CANCELED → 무조건 취소
     * - PAUSED → 무조건 정지 중
     * - endDate가 지났으면 EXPIRED
     * - 그 외는 ACTIVE
     */
    private MembershipStatus calcStatus(MembershipStatus current, LocalDate start, LocalDate adjustedEnd) {
        LocalDate now = LocalDate.now();
        if (current == MembershipStatus.CANCELED) return MembershipStatus.CANCELED;
        if (current == MembershipStatus.PAUSED)   return MembershipStatus.PAUSED;
        if (adjustedEnd != null && now.isAfter(adjustedEnd)) return MembershipStatus.EXPIRED;
        return MembershipStatus.ACTIVE;
    }

    // ---------------------------------------------------------
    // ✅ 6. UI 표시용 상태 문자열 변환
    // ---------------------------------------------------------
    /**
     * MembershipStatus(Enum)를 실제 화면에 보여줄 한글 텍스트로 변환
     * - 취소됨 / 정지 중 / 만료 / 시작 예정 / 사용 중
     */
    private String toUiStatus(MembershipStatus status, LocalDate start) {
        if (status == MembershipStatus.CANCELED) return "취소됨";
        if (status == MembershipStatus.PAUSED)   return "정지 중";
        if (status == MembershipStatus.EXPIRED)  return "만료";
        if (start != null && LocalDate.now().isBefore(start)) return "시작 예정";
        return "사용 중";
    }
}
