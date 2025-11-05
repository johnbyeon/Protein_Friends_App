package com.my.back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 지점 목록 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GymLocationResponse {

    /**
     * 지점 번호
     */
    private Long gId;

    /**
     * 지점명
     */
    private String gName;

    /**
     * 현재 인원
     */
    private Integer currentCapacity;
}
