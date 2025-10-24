package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 16_2. 개인 식단 등록 상세 (meal_log_list)
 *
 * 각 식단 기록의 세부 항목 테이블
 */
@Entity
@Table(name = "meal_log_list")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealLogList {
    /** 등록 번호 */
    @Id
    @Column(name = "record_id", nullable = false)
    private Long recordId;

    /** 식사정보(아침,점심,저녁,간식,브런치,야식,기타) */
    @Column(name = "meal_type", nullable = false)
    private String mealType;

    /** 섭취 음식과 섭취량 기록용 */
    @Column(name = "food_note")
    private String foodNote;

    /** 트레이너의 코멘트 */
    @Column(name = "t_comment")
    private String trainerComment;

    /** 식단 사진 URL */
    @Column(name = "t_pic_url")
    private String pictureUrl;
}
