package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 16_1. 개인 식단 등록 (meal_log)
 *
 * 유저가 식단을 등록하고 트레이너가 확인 및 코멘트를 남기는 테이블
 */
@Entity
@Table(name = "meal_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealLog {
    /** 등록 번호 */
    @Id
    @Column(name = "record_id", nullable = false)
    private Long recordId;

    /** 유저아이디 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", nullable = false)
    private Users users;

    /** 트레이너 등록번호 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t_id", nullable = false)
    private TrainerInfo trainer;

    /** 식사정보(아침,점심,브런치등) */
    @Column(name = "meal_type", nullable = false)
    private String mealType;

    /** 등록일 */
    @Column(name = "date", nullable = false)
    private LocalDateTime date;

}
