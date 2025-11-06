package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ✅ PosResponseDto — 현장 판매 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosResponseDto {

    /**
     * 생성된 기록 ID
     */
    @JsonProperty("recordId")
    private Long recordId;

    /**
     * 결제 금액
     */
    @JsonProperty("price")
    private BigDecimal price;

    /**
     * 판매 타입 (PT_PASS, MEMBERSHIP)
     */
    @JsonProperty("saleType")
    private String saleType;

    /**
     * 판매 일시
     */
    @JsonProperty("saleDate")
    private LocalDateTime saleDate;

    /**
     * 성공 메시지
     */
    @JsonProperty("message")
    private String message;
}