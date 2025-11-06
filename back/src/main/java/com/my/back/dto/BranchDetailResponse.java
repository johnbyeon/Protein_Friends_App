package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 지점 상세 정보 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchDetailResponse {

    /**
     * 지점 번호
     */
    @JsonProperty("gId")
    private Long gId;

    /**
     * 지점명
     */
    @JsonProperty("gName")
    private String gName;

    /**
     * 지점 주소
     */
    @JsonProperty("gAddress")
    private String gAddress;

    /**
     * 지점 전화번호
     */
    @JsonProperty("gTel")
    private String gTel;

    /**
     * 이용 시간
     */
    @JsonProperty("gWorkoutDuration")
    private String gWorkoutDuration;

    /**
     * 주차 정보
     */
    @JsonProperty("gParking")
    private String gParking;

    /**
     * 위도
     */
    @JsonProperty("gLatitude")
    private Double gLatitude;

    /**
     * 경도
     */
    @JsonProperty("gLongitude")
    private Double gLongitude;

    /**
     * 지점 이미지 URL
     */
    @JsonProperty("gImageUrl")
    private String gImageUrl;

    /**
     * 주변 역 정보 목록
     */
    @JsonProperty("stations")
    private List<BranchStationResponse> stations;

    /**
     * 리뷰 작성 가능 여부
     */
    @JsonProperty("canWriteReview")
    private Boolean canWriteReview;
}
