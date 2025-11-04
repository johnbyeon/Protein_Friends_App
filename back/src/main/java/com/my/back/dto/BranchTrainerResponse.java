package com.my.back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 지점 트레이너 정보 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchTrainerResponse {

    /**
     * 트레이너 ID
     */
    private Long tId;

    /**
     * 트레이너 이름
     */
    private String tName;

    /**
     * 자기소개
     */
    private String tBio;

    /**
     * 수상 이력/경력
     */
    private String tCareer;

    /**
     * 전문 분야
     */
    private String tSpecialty;

    /**
     * 트레이너 사진 URL
     */
    private String tImageUrl;
}
