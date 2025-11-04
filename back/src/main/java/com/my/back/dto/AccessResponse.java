package com.my.back.dto;

import com.my.back.entity.AccessDirection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 출입 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccessResponse {

    /**
     * 출입 로그 ID
     */
    private Long aId;

    /**
     * 지점 번호
     */
    private Long gId;

    /**
     * 지점명
     */
    private String gName;

    /**
     * 회원 번호
     */
    private Long uId;

    /**
     * 출입 방향 (IN/OUT)
     */
    private AccessDirection accessDirection;

    /**
     * 출입 시간
     */
    private LocalDateTime accessTime;

    /**
     * 메시지
     */
    private String message;
}
