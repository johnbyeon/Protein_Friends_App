package com.my.back.dto.ptclass;

import java.time.LocalDateTime;
import java.util.List;

public class UserPtClassDtos {

    /** 리스트 조회용 */
    public record ClassItem(
            Long classId,
            String className,
            String classContent,
            LocalDateTime startDatetime,
            LocalDateTime endDatetime,
            int capacity,
            int reservedCount,
            int remaining,
            TrainerInfo trainer
    ) {}

    /** 트레이너 요약 */
    public record TrainerInfo(
            Long trainerId,
            String trainerName
    ) {}

    /** 내가 신청한 클래스 목록 */
    public record MyClassItem(
            Long classId,
            String className,
            LocalDateTime startDatetime,
            LocalDateTime endDatetime,
            TrainerInfo trainer
    ) {}
}
