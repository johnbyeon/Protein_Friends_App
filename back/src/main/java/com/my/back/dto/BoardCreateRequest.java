package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

/**
 * 게시글 생성 요청 DTO
 */
@Data
public class BoardCreateRequest {
    @JsonProperty("pTypeId")
    private Long pTypeId;              // 게시글 타입 ID (필수)
    
    @JsonProperty("pTitle")
    private String pTitle;             // 제목 (필수)
    
    @JsonProperty("pContent")
    private String pContent;           // 내용 (필수)
    
    @JsonProperty("pImageUrl")
    private String pImageUrl;          // 이미지 URL (선택)
    
    @JsonProperty("pLink")
    private String pLink;              // 링크 URL (선택)
    
    @JsonProperty("pIsPopup")
    private Boolean pIsPopup;          // 팝업 여부 (기본: false)
    
    @JsonProperty("isAlwaysPopup")
    private Boolean isAlwaysPopup;     // 상시 팝업 여부 (기본: false)
    
    @JsonProperty("pPopupStartDate")
    private LocalDate pPopupStartDate; // 팝업 시작일 (선택)
    
    @JsonProperty("pPopupEndDate")
    private LocalDate pPopupEndDate;   // 팝업 종료일 (선택)
    
    @JsonProperty("isUnlimited")
    private Boolean isUnlimited;       // 기간 제한 없음 (기본: false)
    
    @JsonProperty("pSetVisible")
    private Boolean pSetVisible;       // 노출 여부 (기본: true)
}
