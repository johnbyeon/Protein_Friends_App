package com.my.back.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ===============================================================
 * ✅ PtPassCardDto — PT 이용권 한 건의 상세정보 DTO
 * ===============================================================
 * 🔹 역할
 *  - PT 이용권 기본정보를 담는 통합 DTO
 *  - "목록"과 "상세" API를 모두 커버
 *  - 프론트 UI에서 바로 카드 형태로 표시 가능
 * ---------------------------------------------------------------
 * 🔹 주요 필드
 *  - ptRecordId: PT 이용권 기록 고유번호
 *  - ptName: PT 이용권 이름
 *  - ptTotalCount: PT 총 횟수
 *  - remainingCount: PT 남은 횟수
 *  - startDate / endDate: 이용기간
 *  - price / salePrice: 금액 정보
 *  - status: 사용 가능 여부
 * ===============================================================
 */
@Getter
@Setter
@Builder
public class PtPassCardDto {

    // ---------- 기본 PT 이용권 정보 ----------
    private Long ptRecordId;          // PT 이용권 기록 고유번호
    private Long ptId;                // PT 상품 ID
    private String ptName;            // PT 이용권 이름
    private String ptPicUrl;          // PT 이용권 이미지 URL
    private Integer ptTotalCount;      // PT 총 횟수
    private Integer remainingCount;    // PT 남은 횟수
    private LocalDate startDate;      // 시작일
    private LocalDate endDate;        // 종료일

    // ---------- 금액 관련 ----------
    private BigDecimal price;         // 원가
    private BigDecimal salePrice;     // 할인가
    private BigDecimal finalPrice;     // 최종 결제 금액

    // ---------- 상태 정보 ----------
    private Boolean status;            // 활성화 상태
    private String uiStatus;           // 사용자에게 표시할 한글 상태

    // ---------- 트레이너 정보 ----------
    private Long trainerId;            // 트레이너 ID
    private String trainerName;        // 트레이너 이름

    // ---------- 생성일 ----------
    private LocalDate createdAt;       // 구매일자
}