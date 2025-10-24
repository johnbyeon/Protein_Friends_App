package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 소셜 계정 연결 상세 정보
 * - social_code: user.google/naver/kakao와 동일한 코드 (PK)
 * - 토큰, 만료시점, 연결시점 등 관리
 */
@Entity
@Table(name = "social_account")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "social_id")
    private Long id;

    /** 어떤 회원의 소셜 계정인지 (FK → user.u_id) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", nullable = false)
    private Users users;

    /** 소셜 제공자 (google, kakao, naver) */
    @Column(length = 20, nullable = false)
    private String provider;

    /** 소셜 제공자 내 고유 사용자 ID (sub, id 등) */
    @Column(name = "provider_user_id", length = 191, nullable = false)
    private String providerUserId;

    /** access token / refresh token (선택) */
    @Column(length = 2048)
    private String accessToken;

    @Column(length = 2048)
    private String refreshToken;

    private LocalDateTime tokenExpiresAt;
    private LocalDateTime connectedAt;
    private LocalDateTime disconnectedAt;

    // (unique provider + provider_user_id)
    @PrePersist
    void onCreate() {
        if (connectedAt == null) connectedAt = LocalDateTime.now();
    }
}