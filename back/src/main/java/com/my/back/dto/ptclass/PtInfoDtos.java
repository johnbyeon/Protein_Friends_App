package com.my.back.dto.ptclass;

import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * PT 이용권 관련 DTO
 */
public class PtInfoDtos {

    /** 이용권 등록 요청 */
    @Builder
    public record CreateReq(
            Long uId,
            Long tId,
            String ptName,
            int ptTotalCount,
            BigDecimal price,
            BigDecimal salePrice,
            LocalDate startDate,
            LocalDate endDate
    ) {}

    /** 이용권 상세 조회 */
    @Builder
    public record DetailRes(
            Long ptRecordId,
            String ptName,
            int ptTotalCount,
            int remainingCount,
            boolean status,
            BigDecimal price,
            BigDecimal salePrice,
            LocalDate startDate,
            LocalDate endDate,
            LocalDateTime createdAt
    ) {}

    /** 마이페이지 요약 */
    @Builder
    public record SummaryRes(
            String ptName,
            int remainingCount,
            boolean status
    ) {}
}
