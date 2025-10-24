package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recommend_meal")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendMeal {

    /** 식단번호 (Primary Key, Auto Increment) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rec_id")
    private Long id;

    /** 트레이너 등록번호 (Trainer ID) */
    @Column(name = "t_id", nullable = false)
    private Long trainerId;

    /** 유저 ID */
    @Column(name = "u_id", nullable = false)
    private Long userId;

    /** 해당 날짜 */
    @Column(name = "date", nullable = false)
    private LocalDate date;

    /** 추천 식단 상세 목록 (1:N 관계 매핑) */
    @OneToMany(mappedBy = "recommendMeal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecommendMealLog> mealLogs = new ArrayList<>();
}
