package com.my.back.dto.meal;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 관리자 식단 관리용 DTO
 * - 식단 등록 / 상세 / 수정 / 삭제용
 * - 엔티티 직접 노출 X (DTO만 사용)
 */
public class MealLogAdminDtos {

    /**
     * 식단 상세 항목 DTO (한 끼 안에 들어가는 음식 리스트)
     */
    public record MealLogListDTO(
            Long id,               // 상세 항목 PK
            String mealType,       // 아침/점심/저녁 등
            String foodNote,       // 음식 + 양(예: 닭가슴살 150g)
            String trainerComment, // 트레이너 코멘트
            String pictureUrl      // 사진 URL
    ) {}

    /**
     * 식단 생성 요청 DTO
     * - uId: 회원 ID
     * - tId: 트레이너 ID
     * - mealType: 아침/점심/저녁
     * - mealLogList: 음식 항목 리스트
     */
    public record CreateReq(
            Long uId,
            Long tId,
            String mealType,
            List<MealLogListDTO> mealLogList
    ) {}

    /**
     * 식단 수정 요청 DTO
     * - 현재는 식사 타입만 수정 가능
     */
    public record UpdateReq(
            String mealType
    ) {}

    /**
     * 식단 조회 응답 DTO
     * - recordId: 식단 PK
     * - date: 등록일
     * - mealLogList: 음식 항목 리스트
     */
    public record Res(
            Long recordId,
            Long uId,
            Long tId,
            String mealType,
            LocalDateTime date,
            List<MealLogListDTO> mealLogList
    ) {}
}
