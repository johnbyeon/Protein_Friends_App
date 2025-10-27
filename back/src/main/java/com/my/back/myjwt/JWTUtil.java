package com.my.back.myjwt;

import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * ✅ JWT 토큰 생성/검증 유틸리티
 * - 토큰 생성(createJwt)
 * - 토큰 파싱(getEmail, getRole)
 * - 만료 여부(isExpired)
 */
@Component
public class JWTUtil {

    private final SecretKey secretKey;

    // application.yml -> spring.jwt.secret 에서 불러옴
    public JWTUtil(@Value("${spring.jwt.secret}") String secret) {
        this.secretKey = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8),
                Jwts.SIG.HS256.key().build().getAlgorithm()
        );
    }

    /** ✅ JWT 생성 */
    public String createJwt(String email, String role, Long expireMs) {
        return Jwts.builder()
                .claim("email", email)
                .claim("role", role)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expireMs))
                .signWith(secretKey)
                .compact();
    }

    /** ✅ 이메일 추출 */
    public String getEmail(String token) {
        return Jwts.parser()
                .verifyWith(secretKey).build()
                .parseSignedClaims(token)
                .getPayload()
                .get("email", String.class);
    }

    /** ✅ 역할(Role) 추출 */
    public String getRole(String token) {
        return Jwts.parser()
                .verifyWith(secretKey).build()
                .parseSignedClaims(token)
                .getPayload()
                .get("role", String.class);
    }

    /** ✅ 만료 여부 체크 */
    public Boolean isExpired(String token) {
        Date expiration = Jwts.parser()
                .verifyWith(secretKey).build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
        return expiration.before(new Date());
    }
}
