package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDate;

/**
 * ✅ PosMembershipRequestDto — 회원권 현장 판매 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosMembershipRequestDto {

    /**
     * 회원 ID (not null)
     */
    @NotNull(message = "회원 ID는 필수입니다.")
    @JsonProperty("userId")
    private Long userId;



    /**
     * 회원권 ID (not null)
     */
    @NotNull(message = "회원권 ID는 필수입니다.")
    @JsonProperty("membershipId")
    private Long membershipId;

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
     * 결제 금액 (not null, positive)
     */
    @NotNull(message = "결제 금액은 필수입니다.")
    @Positive(message = "결제 금액은 0 이상이어야 합니다.")
    @JsonProperty("price")
    private Integer price;

    /**
     * 할인 금액 (default 0)
     */
    @Builder.Default
    @JsonProperty("salePrice")
    private Integer salePrice = 0;
}