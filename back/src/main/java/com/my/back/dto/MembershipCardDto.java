package com.my.back.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

/**
 * ===============================================================
 * ✅ MembershipCardDto — 회원권 한 건의 상세정보 DTO
 * ===============================================================
 * 🔹 역할
 *  - 회원권 기본정보 + 정지 이력(stops)을 함께 담는 통합 DTO
 *  - "목록"과 "상세" API를 모두 커버
 *  - 프론트 UI에서 바로 카드 형태로 표시 가능
 * ---------------------------------------------------------------
 * 🔹 주요 필드
 *  - mLogId: 회원권 기록 고유번호
 *  - title: 회원권 이름
 *  - status: 내부 Enum 상태 (ACTIVE, EXPIRED, PAUSED, CANCELED)
 *  - uiStatus: 사용자에게 표시할 한글 상태 ("사용 중", "정지 중", ...)
 *  - startDate / endDate: 이용기간
 *  - price / discount / finalPrice: 금액 정보
 *  - stopUsed / stopLimit: 정지 사용횟수/한도
 *  - stops: 정지이력 리스트 (StopLogDto)
 * ===============================================================
 */
@Getter
@Setter
@Builder
public class MembershipCardDto {

    // ---------- 기본 회원권 정보 ----------
    private Long mLogId;          // 회원권 기록 고유번호
    private String title;         // 회원권 이름
    private String code;          // M-000001 형식 코드
    private String status;        // Enum 상태
    private String uiStatus;      // 사용자에게 표시할 한글 상태
    private LocalDate buyDate;    // 구매일자
    private LocalDate startDate;  // 시작일
    private LocalDate endDate;    // 종료일 (정지 보정 포함)
    private String imageUrl;      // 회원권 이미지 URL

    // ---------- 금액 및 정지 관련 ----------
    private int stopUsed;         // 실제 정지 사용 횟수
    private int stopLimit;        // 가능한 정지 횟수 한도
    private Integer price;        // 원가
    private Integer discount;     // 할인액
    private Integer finalPrice;   // 최종 결제 금액

    // ---------- 상세 (정지내역 포함) ----------
    private List<StopLogDto> stops; // 정지내역 리스트
}
