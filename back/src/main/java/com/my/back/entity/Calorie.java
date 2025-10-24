package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "calorie")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Calorie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "food_id", nullable = false)
    private Long foodId;

    @Column(name = "food_name", nullable = false)
    private String foodName;

    @Column(nullable = false)
    private Long serving;

    @Column(nullable = false)
    private Long calorie;

    @Column(nullable = false)
    private Long carbohydrate;

    @Column(nullable = false)
    private Long protein;

    @Column(nullable = false)
    private Long fat;

    @Column(nullable = false)
    private String category;
}