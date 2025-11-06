package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 트레이너 본인 프로필 조회 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainerProfileResponse {
    @JsonProperty("tId")
    private Long tId;              // 트레이너 ID
    
    @JsonProperty("tName")
    private String tName;          // 이름
    
    @JsonProperty("tBirthDay")
    private LocalDate tBirthDay;      // 생년월일
    
    @JsonProperty("tPhoneNumber")
    private String tPhoneNumber;   // 전화번호
    
    @JsonProperty("tAwardTitle")
    private String tAwardTitle;    // 수상 이력
    
    @JsonProperty("tAboutMe")
    private String tAboutMe;       // 자기소개
    
    @JsonProperty("tImageUrl")
    private String tImageUrl;      // 프로필 사진
    
    @JsonProperty("isEmployed")
    private Boolean isEmployed;    // 재직 상태
    
    @JsonProperty("gymName")
    private String gymName;        // 소속 지점명
    
    @JsonProperty("gId")
    private Long gId;              // 소속 지점 ID
}

