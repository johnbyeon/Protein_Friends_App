package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

/**
 * PT 이용권 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PTServiceResponseDto {

    @JsonProperty("ptId")
    private Long ptId;

    @JsonProperty("ptPicUrl")
    private String ptPicUrl;

    @JsonProperty("ptName")
    private String ptName;

    @JsonProperty("ptCount")
    private Integer ptCount;

    @JsonProperty("ptDurationDays")
    private Integer ptDurationDays;

    @JsonProperty("ptPrice")
    private Integer ptPrice;

    @JsonProperty("ptSalePrice")
    private Integer ptSalePrice;

    @JsonProperty("isActive")
    private Boolean isActive;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updateAt")
    private LocalDateTime updateAt;
}