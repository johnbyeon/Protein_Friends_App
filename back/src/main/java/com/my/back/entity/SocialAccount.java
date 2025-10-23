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
@Table(name = "social_account")  // DB 테이블명 명시 (필수)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialAccount {

    /**
     * 연결 코드 (PK, String)
     * - ex: "g001", "k001", "n001"
     * - user.google = "g001" → 이 레코드와 연결
     */
    @Id
    @Column(name = "social_code", length = 10)
    private String socialCode;

    /** 소셜 제공자 (google, kakao, naver) */
    private String provider;

    /** 소셜 제공자 내 고유 사용자 ID (sub, id) */
    private String providerUserId;

    /** OAuth2 access token (필수, 최대 2048자) */
    private String accessToken;

    /** refresh token (nullable, 최대 2048자) */
    private String refreshToken;

    /** access token 만료 시점 (nullable) */
    private LocalDateTime tokenExpiresAt;

    /** 최초 연결 시점 (not null) */
    private LocalDateTime connectedAt;

    /** 연결 해제 시점 (null = 연결 중) */
    private LocalDateTime disconnectedAt;

    /** 역방향 관계 (선택적, 성능 이슈 시 제거 가능) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "social_code", insertable = false, updatable = false)
    private User user;
}
