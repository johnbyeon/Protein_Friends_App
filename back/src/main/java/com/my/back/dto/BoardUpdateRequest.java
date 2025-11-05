package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

/**
 * 게시글 수정 요청 DTO
 */
@Data
public class BoardUpdateRequest {
    @JsonProperty("pTypeId")
    private Long pTypeId;              // 게시글 타입 ID (선택 - 변경 가능)
    
    @JsonProperty("pTitle")
    private String pTitle;             // 제목
    
    @JsonProperty("pContent")
    private String pContent;           // 내용
    
    @JsonProperty("pImageUrl")
    private String pImageUrl;          // 이미지 URL
    
    @JsonProperty("pLink")
    private String pLink;              // 링크 URL
    
    @JsonProperty("pIsPopup")
    private Boolean pIsPopup;          // 팝업 여부
    
    @JsonProperty("isAlwaysPopup")
    private Boolean isAlwaysPopup;     // 상시 팝업 여부
    
    @JsonProperty("pPopupStartDate")
    private LocalDate pPopupStartDate; // 팝업 시작일
    
    @JsonProperty("pPopupEndDate")
    private LocalDate pPopupEndDate;   // 팝업 종료일
    
    @JsonProperty("isUnlimited")
    private Boolean isUnlimited;       // 기간 제한 없음
    
    @JsonProperty("pSetVisible")
    private Boolean pSetVisible;       // 노출 여부
}
