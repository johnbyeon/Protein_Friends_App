package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * PT 이용권 생성/수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PTServiceRequestDto {

    @NotBlank(message = "이용권 이름은 필수입니다.")
    @JsonProperty("ptName")
    private String ptName;

    @NotNull(message = "이용 횟수는 필수입니다.")
    @Min(value = 1, message = "이용 횟수는 1 이상이어야 합니다.")
    @JsonProperty("ptCount")
    private Integer ptCount;

    @NotNull(message = "유효 기간은 필수입니다.")
    @Min(value = 1, message = "유효 기간은 1일 이상이어야 합니다.")
    @JsonProperty("ptDurationDays")
    private Integer ptDurationDays;

    @NotNull(message = "가격은 필수입니다.")
    @Min(value = 0, message = "가격은 0 이상이어야 합니다.")
    @JsonProperty("ptPrice")
    private Integer ptPrice;

    @Min(value = 0, message = "할인가는 0 이상이어야 합니다.")
    @JsonProperty("ptSalePrice")
    private Integer ptSalePrice = 0;

    @JsonProperty("ptPicUrl")
    private String ptPicUrl = "";

    @JsonProperty("isActive")
    private Boolean isActive = true;
}