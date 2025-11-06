package com.my.back.dto;

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
    private String stationName;

    /**
     * 노선 번호
     */
    private String stationLine;

    /**
     * 도보 시간 (분)
     */
    private String walkTime;
}
