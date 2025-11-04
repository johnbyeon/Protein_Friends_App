package com.my.back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 출입 요청 DTO (입장/퇴장 공통)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccessRequest {

    /**
     * 지점 번호
     */
    private Long gId;
}
