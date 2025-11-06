package com.my.back.dto;

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
    private Long gId;

    /**
     * 지점명
     */
    private String gName;

    /**
     * 지점 주소
     */
    private String gAddress;

    /**
     * 지점 전화번호
     */
    private String gTel;

    /**
     * 이용 시간
     */
    private String gWorkoutDuration;

    /**
     * 주차 정보
     */
    private String gParking;

    /**
     * 위도
     */
    private Double gLatitude;

    /**
     * 경도
     */
    private Double gLongitude;

    /**
     * 지점 이미지 URL
     */
    private String gImageUrl;

    /**
     * 주변 역 정보 목록
     */
    private List<BranchStationResponse> stations;
}
