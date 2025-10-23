package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * 트레이너 정보 테이블 (5. trainer_info)
 * - t_id: auto increment PK
 * - u_id: user.u_id 참조 (N:1)
 * - g_id: gym_info.g_id 참조 (N:1)
 * - 재직상태 비활성 시 user_role → USER로 강등 (비즈니스 로직)
 */
@Entity
@Table(name = "trainer_info")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainerInfo {

    /**
     * 트레이너 등록번호 (PK, auto increment)
     * - 등록 순서대로 증가
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "t_id")
    private Long tId;

    /**
     * 지점 번호 (not null)
     * - gym_info.g_id 참조
     */
    @Column(name = "g_id", nullable = false)
    private Long gId;

    /**
     * 트레이너 유저 ID (not null)
     * - user.u_id 참조
     */
    @Column(name = "u_id", nullable = false)
    private Long uId;

    /**
     * 트레이너 이름 (not null)
     * - 예: "김트레이너"
     */
    @Column(name = "t_name", nullable = false, length = 50)
    private String tName;

    /**
     * 트레이너 생일 (not null)
     * - 예: 1990-05-15
     */
    @Column(name = "t_birth_day", nullable = false)
    private LocalDate tBirthDay;

    /**
     * 트레이너 연락처 (not null)
     * - 예: "010-1234-5678"
     */
    @Column(name = "t_phone_number", nullable = false, length = 20)
    private String tPhoneNumber;

    /**
     * 수상이력 (nullable)
     * - 예: "2023 전국 피트니스 대회 1위"
     */
    @Column(name = "t_award_title", length = 500)
    private String tAwardTitle;

    /**
     * 자기소개 (nullable)
     * - 최대 1000자
     */
    @Column(name = "t_about_me", length = 1000)
    private String tAboutMe;

    /**
     * 재직 상태 (default true)
     * - false 시 user_role → USER로 강등 (서비스 로직)
     */
    @Column(name = "t_is_employed")
    @Builder.Default
    private Boolean isEmployed = true;

    /**
     * 트레이너 사진 URL (not null)
     * - 예: "https://s3.amazonaws.com/trainer/123.jpg"
     */
    @Column(name = "t_image_url", nullable = false, length = 500)
    private String tImageUrl;

    // === 관계 매핑 (LAZY) ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "g_id", insertable = false, updatable = false)
    private GymInfo gymInfo;
}