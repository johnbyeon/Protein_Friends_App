package com.my.back.dto;

import com.my.back.entity.AccessDirection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 🔹 ActiveAccessDto
 * 회원의 현재 출입 상태를 나타내는 DTO
 *
 * ✅ 필드 설명
 * - active: 현재 입장 중(true)인지 여부
 * - gId: 현재 입장 중인 지점 ID (없으면 null)
 * - accessDirection: 마지막 출입 방향 (IN / OUT)
 * - accessTime: 마지막 출입 시간
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActiveAccessDto {

    /** 현재 입장 중인지 여부 */
    private boolean active;

    /** 현재 입장 중인 지점 ID (없을 수 있음) */
    private Long gId;

    /** 마지막 출입 방향 */
    private AccessDirection accessDirection;

    /** 마지막 출입 시간 */
    private LocalDateTime accessTime;
}
