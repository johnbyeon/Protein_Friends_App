package com.my.back.dto;

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
    private Long tId;              // 트레이너 ID
    private String tName;          // 이름
    private LocalDate tBirthDay;      // 생년월일
    private String tPhoneNumber;   // 전화번호
    private String tAwardTitle;    // 수상 이력
    private String tAboutMe;       // 자기소개
    private String tImageUrl;      // 프로필 사진
    private Boolean isEmployed;    // 재직 상태
    private String gymName;        // 소속 지점명
    private Long gId;              // 소속 지점 ID
}

