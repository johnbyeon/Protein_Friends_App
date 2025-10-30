package com.my.back.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

/**
 * 소셜 계정 연결 상세 정보
 * - social_code: user.google/naver/kakao와 동일한 코드 (PK)
 * - 토큰, 만료시점, 연결시점 등 관리
 */
@Entity
@Table(
        name = "social_account",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_provider_user", columnNames = {"provider", "provider_user_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "social_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", nullable = false)
    @JsonIgnore
    private Users users;

    @Column(length = 20, nullable = false)
    private String provider;

    @Column(name = "provider_user_id", length = 191, nullable = false)
    private String providerUserId;

    @Column(name = "social_code", length = 64, unique = true)
    private String socialCode;

    @Column(length = 1024)
    private String accessToken;

    @Column(length = 1024)
    private String refreshToken;

    private LocalDateTime tokenExpiresAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    private LocalDateTime connectedAt;
    private LocalDateTime disconnectedAt;

    @PrePersist
    void onCreate() {
        if (connectedAt == null) connectedAt = LocalDateTime.now();
        if (socialCode == null) socialCode = provider + "_" + providerUserId;
    }

    public void disconnect() {
        this.active = false;
        this.disconnectedAt = LocalDateTime.now();
    }
}
