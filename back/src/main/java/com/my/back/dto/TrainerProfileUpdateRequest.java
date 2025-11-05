package com.my.back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 트레이너 본인 프로필 수정 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainerProfileUpdateRequest {
    private String tAwardTitle;    // 수상 이력 (선택)
    private String tAboutMe;       // 자기소개 (선택)
    private String tImageUrl;      // 프로필 사진 URL (선택)
}

