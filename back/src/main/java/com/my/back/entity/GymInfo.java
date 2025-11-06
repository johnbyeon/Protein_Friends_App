package com.my.back.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

/**
 * 지점 정보 테이블 (11_1. gym_info)
 * - g_id: auto increment PK
 * - 좌표, 이용시간, 주차정보 포함
 */
@Entity
@Table(name = "gym_info")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GymInfo {

    /**
     * 지점 고유번호 (PK, auto increment)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "g_id")
    @JsonProperty("gId")
    private Long gId;

    /**
     * 지점명 (not null)
     * - 예: "강남 헬스장"
     */
    @Column(name = "g_name", nullable = false, length = 100)
    @JsonProperty("gName")
    private String gName;

    /**
     * 지점 주소 (not null)
     * - 예: "서울특별시 강남구 테헤란로 123"
     */
    @Column(name = "g_address", nullable = false, length = 200)
    @JsonProperty("gAddress")
    private String gAddress;

    /**
     * 지점 전화번호 (not null)
     * - 예: "02-1234-5678"
     */
    @Column(name = "g_tel", nullable = false, length = 20)
    @JsonProperty("gTel")
    private String gTel;

    /**
     * 이용시간 (not null)
     * - 예: "06:00 ~ 23:00"
     */
    @Column(name = "g_workout_duration", nullable = false, length = 100)
    @JsonProperty("gWorkoutDuration")
    private String gWorkoutDuration;

    /**
     * 주차정보 (not null)
     * - 예: "무료 주차 2시간", "주차 불가"
     */
    @Column(name = "g_parking", nullable = false, length = 200)
    @JsonProperty("gParking")
    private String gParking;

    /**
     * 위도 (not null)
     * - 예: 37.4979
     */
    @Column(name = "g_latitude", nullable = false)
    @JsonProperty("gLatitude")
    private Double gLatitude;

    /**
     * 경도 (not null)
     * - 예: 127.0276
     */
    @Column(name = "g_longitude", nullable = false)
    @JsonProperty("gLongitude")
    private Double gLongitude;

    /**
     * 지점 사진 URL (nullable)
     * - 예: "https://s3.amazonaws.com/gym/1.jpg"
     */
    @Column(name = "g_image_url", length = 500)
    @JsonProperty("gImageUrl")
    private String gImageUrl;
}