package com.my.back.dto.ptclass;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 관리자 PT 클래스 관리용 DTO 모음
 * - PT 클래스 등록 / 수정 / 상세조회 / 회원 예약 관리
 * - 프론트 관리자 페이지와 직접 매핑되는 데이터 구조
 */
public class AdminPtClassDtos {

    /**
     * PT 클래스 목록(스케줄) 조회 시 한 항목
     * - 관리자 시간표 리스트에서 사용
     */
    public record ScheduleItem(
            Long classId,               // 수업 ID
            String className,           // 수업명
            String classContent,        // 수업 설명 / 내용
            LocalDateTime startDatetime,// 시작 일시
            LocalDateTime endDatetime,  // 종료 일시
            Integer maxCapacity,        // 정원
            Integer reservedCount,      // 예약된 인원수
            Integer remainingCapacity,  // 남은 자리수
            TrainerSummary trainer,     // 담당 트레이너 정보
            Integer ptMinusCount        // 예약 시 차감되는 PT 횟수(1회 or n회 PT 시스템 대응)
    ) { }

    /**
     * PT 클래스 상세 정보
     * - 클래스 상세 정보 화면 + 예약 회원 리스트
     */
    public record ClassDetail(
            Long classId,
            String className,
            String classContent,
            LocalDateTime startDatetime,
            LocalDateTime endDatetime,
            Integer maxCapacity,
            Integer ptMinusCount,
            Integer reservedCount,
            Integer remainingCapacity,
            TrainerSummary trainer,         // 트레이너 기본 정보
            List<BookedUser> bookedUsers    // 예약된 사용자 목록
    ) { }

    /**
     * 트레이너 요약 정보
     * - 이름 + ID만 전달 (간단 프로필)
     */
    public record TrainerSummary(
            Long trainerId,
            String trainerName
    ) { }

    /**
     * 클래스에 예약된 회원 정보
     * - 관리자 예약 현황 테이블에서 사용
     */
    public record BookedUser(
            Long userId,                // 회원 ID
            String userName,            // 회원 이름
            String email,               // 이메일
            String phone,               // 연락처
            LocalDateTime bookedAt      // 예약 등록 시간
    ) { }

    /**
     * PT 클래스 생성 요청
     * - 관리자 신규 수업 등록 폼
     */
    public record CreateClassRequest(
            @NotBlank String className,                       // 수업명
            @NotBlank String classContent,                    // 수업 설명
            @NotNull Long trainerId,                          // 담당 트레이너 ID
            @NotNull @FutureOrPresent LocalDateTime startDatetime, // 시작 시간
            @NotNull @FutureOrPresent LocalDateTime endDatetime,   // 종료 시간
            @NotNull @Positive Integer maxCapacity,           // 정원
            @NotNull @Positive Integer ptMinusCount           // 차감 PT 횟수
    ) { }

    /**
     * PT 클래스 수정 요청
     * - 관리자 수업 수정 화면
     */
    public record UpdateClassRequest(
            @NotBlank String className,
            @NotBlank String classContent,
            @NotNull Long trainerId,
            @NotNull @FutureOrPresent LocalDateTime startDatetime,
            @NotNull @FutureOrPresent LocalDateTime endDatetime,
            @NotNull @Positive Integer maxCapacity,
            @NotNull @Positive Integer ptMinusCount
    ) { }

    /**
     * PT 클래스 회원 예약 요청
     * - userId만 전달하면 백엔드가 수업 참여 처리 + PT차감
     */
    public record BookingRequest(
            @NotNull Long userId
    ) { }
}
