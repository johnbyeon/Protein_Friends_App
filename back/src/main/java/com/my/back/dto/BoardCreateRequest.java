package com.my.back.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 게시글 생성 요청 DTO
 */
@Data
public class BoardCreateRequest {
    private Long pTypeId;              // 게시글 타입 ID (필수)
    private String pTitle;             // 제목 (필수)
    private String pContent;           // 내용 (필수)
    private String pImageUrl;          // 이미지 URL (선택)
    private String pLink;              // 링크 URL (선택)
    private Boolean pIsPopup;          // 팝업 여부 (기본: false)
    private Boolean isAlwaysPopup;     // 상시 팝업 여부 (기본: false)
    private LocalDate pPopupStartDate; // 팝업 시작일 (선택)
    private LocalDate pPopupEndDate;   // 팝업 종료일 (선택)
    private Boolean isUnlimited;       // 기간 제한 없음 (기본: false)
    private Boolean pSetVisible;       // 노출 여부 (기본: true)
}
