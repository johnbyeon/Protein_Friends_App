package com.my.back.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recommend_meal_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendMealLog {

    /** 식단번호 (Primary Key, Auto Increment) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rec_id")
    @JsonProperty("id")
    private Long id;

    /** 추천 음식 */
    @Column(name = "rec_food", nullable = false, length = 255)
    @JsonProperty("food")
    private String food;

    /** 총 칼로리 */
    @Column(name = "rec_kcal")
    @JsonProperty("kcal")
    private Integer kcal;

    /** 식단 이미지 (이미지 URL 등) */
    @Column(name = "rec_pic", length = 500)
    @JsonProperty("pic")
    private String pic;

    /** 식사 정보 (아침, 점심, 저녁, 간식 등) */
    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 20)
    @JsonProperty("mealType")
    private MealType mealType;

    /** 추천 식단(부모) — 다대일 관계 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommend_meal_id", nullable = false)
    private RecommendMeal recommendMeal;
}
