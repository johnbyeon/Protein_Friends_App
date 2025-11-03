package com.my.back.dto.gym;

/**
 * 지점(GymInfo) 관리용 DTO 모음
 * - Controller <-> Service 전용
 */
public class GymInfoDtos {

    /** 지점 등록 요청 */
    public record CreateReq(
            String gName,
            String gAddress,
            String gTel,
            String gWorkoutDuration,
            String gParking,
            Double gLatitude,
            Double gLongitude,
            String gImageUrl
    ) { }

    /** 지점 수정 요청 */
    public record UpdateReq(
            String gName,
            String gAddress,
            String gTel,
            String gWorkoutDuration,
            String gParking,
            Double gLatitude,
            Double gLongitude,
            String gImageUrl
    ) { }

    /** 지점 응답 */
    public record Res(
            Long gId,
            String gName,
            String gAddress,
            String gTel,
            String gWorkoutDuration,
            String gParking,
            Double gLatitude,
            Double gLongitude,
            String gImageUrl
    ) { }
}
