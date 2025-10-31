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

    /** PK: 개별 음식 항목 */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;   // ✅ 새 PK

    /** FK: 어느 meal_log 에 속하는지 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private MealLog mealLog;  // ✅ FK로 변경

    /** 식사 타입 */
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
