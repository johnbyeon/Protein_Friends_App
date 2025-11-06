package com.my.back.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ===============================================================
 * ✅ StopLogDto — 회원권 정지 이력 단위 DTO
 * ===============================================================
 * 🔹 역할
 *  - 각 회원권의 정지 기록 1건을 표현
 *  - 회원권 상세보기 시 하단에 리스트 형태로 표시됨
 * ---------------------------------------------------------------
 * 🔹 주요 필드
 *  - stopLogId: 정지기록 고유번호
 *  - membershipId: 연결된 회원권 ID
 *  - startDate / endDate: 정지 시작·종료 기간
 *  - plusDate: 정지로 인해 연장된 일수
 *  - reasonNote: 정지 사유 코드(숫자 또는 Enum)
 * ===============================================================
 */
@Getter
@Builder
public class StopLogDto {
    private Long stopLogId;
    private Long membershipId;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime stopDate;
    private Integer plusDate;
    private Integer reasonNote;
}
