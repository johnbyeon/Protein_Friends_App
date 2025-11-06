package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 주변 역 정보 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchStationResponse {

    /**
     * 역 이름
     */
    @JsonProperty("stationName")
    private String stationName;

    /**
     * 노선 번호
     */
    @JsonProperty("stationLine")
    private String stationLine;

    /**
     * 도보 시간 (분)
     */
    @JsonProperty("walkTime")
    private String walkTime;
}
