package com.my.back.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 게시글 수정 요청 DTO
 */
@Data
public class BoardUpdateRequest {
    private Long pTypeId;              // 게시글 타입 ID (선택 - 변경 가능)
    private String pTitle;             // 제목
    private String pContent;           // 내용
    private String pImageUrl;          // 이미지 URL
    private String pLink;              // 링크 URL
    private Boolean pIsPopup;          // 팝업 여부
    private Boolean isAlwaysPopup;     // 상시 팝업 여부
    private LocalDate pPopupStartDate; // 팝업 시작일
    private LocalDate pPopupEndDate;   // 팝업 종료일
    private Boolean isUnlimited;       // 기간 제한 없음
    private Boolean pSetVisible;       // 노출 여부
}
