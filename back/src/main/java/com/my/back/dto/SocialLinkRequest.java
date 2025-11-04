package com.my.back.dto;

import lombok.Data;

/**
 * 소셜 계정 연결 요청 DTO
 * OAuth에서 받은 정보를 전달
 */
@Data
public class SocialLinkRequest {
    private String provider;           // google, naver, kakao
    private String providerUserId;     // 소셜 계정 고유 ID
    private String accessToken;        // 액세스 토큰
    private String refreshToken;       // 리프레시 토큰
    private Long tokenExpiresIn;       // 토큰 만료 시간 (초)
}

