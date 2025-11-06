package com.my.back.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("foodId")
    private Long foodId;

    @Column(name = "food_name", nullable = false)
    @JsonProperty("foodName")
    private String foodName;

    @Column(nullable = false)
    @JsonProperty("serving")
    private Long serving;

    @Column(nullable = false)
    @JsonProperty("calorie")
    private Long calorie;

    @Column(nullable = false)
    @JsonProperty("carbohydrate")
    private Long carbohydrate;

    @Column(nullable = false)
    @JsonProperty("protein")
    private Long protein;

    @Column(nullable = false)
    @JsonProperty("fat")
    private Long fat;

    @Column(nullable = false)
    @JsonProperty("category")
    private String category;
}