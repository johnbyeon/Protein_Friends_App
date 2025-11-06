package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("tId")
    private Long tId;

    /**
     * 트레이너 이름
     */
    @JsonProperty("tName")
    private String tName;

    /**
     * 자기소개
     */
    @JsonProperty("tBio")
    private String tBio;

    /**
     * 수상 이력/경력
     */
    @JsonProperty("tCareer")
    private String tCareer;

    /**
     * 전문 분야
     */
    @JsonProperty("tSpecialty")
    private String tSpecialty;

    /**
     * 트레이너 사진 URL
     */
    @JsonProperty("tImageUrl")
    private String tImageUrl;
}
