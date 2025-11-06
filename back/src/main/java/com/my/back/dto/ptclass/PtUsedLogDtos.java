package com.my.back.dto.ptclass;

import lombok.Builder;
import java.time.LocalDateTime;

/**
 * PT 사용 기록 DTO
 */
public class PtUsedLogDtos {

    /** 사용 로그 항목 */
    @Builder
    public record LogItem(
            Long logId,
            Long classId,
            String className,
            LocalDateTime date,
            int usedCount,
            int totalCount,
            boolean status
    ) {}
}
