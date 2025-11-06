package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ✅ PosPtPassRequestDto — PT 이용권 현장 판매 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosPtPassRequestDto {

    /**
     * 회원 ID (not null)
     */
    @NotNull(message = "회원 ID는 필수입니다.")
    @JsonProperty("userId")
    private Long userId;

    /**
     * PT 서비스 ID (not null)
     */
    @NotNull(message = "PT 서비스 ID는 필수입니다.")
    @JsonProperty("ptServiceId")
    private Long ptServiceId;

    /**
     * PT 이름 (not null)
     */
    @NotNull(message = "PT 이름은 필수입니다.")
    @JsonProperty("ptName")
    private String ptName;

    /**
     * PT 총 횟수 (not null, positive)
     */
    @NotNull(message = "PT 총 횟수는 필수입니다.")
    @Positive(message = "PT 횟수는 1 이상이어야 합니다.")
    @JsonProperty("ptTotalCount")
    private Integer ptTotalCount;

    /**
     * 시작일 (not null)
     */
    @NotNull(message = "시작일은 필수입니다.")
    @JsonProperty("startDate")
    private LocalDate startDate;

    /**
     * 종료일 (not null)
     */
    @NotNull(message = "종료일은 필수입니다.")
    @JsonProperty("endDate")
    private LocalDate endDate;

    /**
     * 가격 (not null, positive)
     */
    @NotNull(message = "가격은 필수입니다.")
    @Positive(message = "가격은 0 이상이어야 합니다.")
    @JsonProperty("price")
    private BigDecimal price;

    /**
     * 할인가격 (default 0)
     */
    @Builder.Default
    @JsonProperty("salePrice")
    private BigDecimal salePrice = BigDecimal.ZERO;
}