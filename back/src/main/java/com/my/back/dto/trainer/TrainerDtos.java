package com.my.back.dto.trainer;

import java.time.LocalDate;

/**
 * 트레이너 관리용 DTO 모음
 * - Controller <-> Service 통신 전용
 */
public class TrainerDtos {

    /** 트레이너 생성 요청 */
    public record CreateReq(
            Long gId,
            Long uId,
            String tName,
            LocalDate tBirthDay,
            String tPhoneNumber,
            String tAwardTitle,
            String tAboutMe,
            Boolean isEmployed,
            String tImageUrl
    ) { }

    /** 트레이너 수정 요청 (부분 수정 허용) */
    public record UpdateReq(
            Long gId,
            String tName,
            LocalDate tBirthDay,
            String tPhoneNumber,
            String tAwardTitle,
            String tAboutMe,
            Boolean isEmployed,
            String tImageUrl
    ) { }

    /** 트레이너 응답 */
    public record Res(
            Long tId,
            Long gId,
            Long uId,
            String tName,
            LocalDate tBirthDay,
            String tPhoneNumber,
            String tAwardTitle,
            String tAboutMe,
            Boolean isEmployed,
            String tImageUrl,
            String gymName,   // join 표시용(옵션)
            String userEmail  // join 표시용(옵션)
    ) { }
}
