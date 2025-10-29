package com.my.back.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class EnvCheckConfig {

    @Value("${GOOGLE_CLIENT_ID:NOT_FOUND}")
    private String googleClientId;

    @Value("${GOOGLE_SECRET_ID:NOT_FOUND}")
    private String googleSecretId;

    @Value("${NAVER_CLIENT_ID:NOT_FOUND}")
    private String naverClientId;

    @Value("${KAKAO_CLIENT_ID:NOT_FOUND}")
    private String kakaoClientId;

    @PostConstruct
    public void checkEnv() {
        log.info("🔍 [ENV CHECK] GOOGLE_CLIENT_ID = {}", googleClientId);
        log.info("🔍 [ENV CHECK] GOOGLE_SECRET_ID = {}", googleSecretId);
        log.info("🔍 [ENV CHECK] NAVER_CLIENT_ID  = {}", naverClientId);
        log.info("🔍 [ENV CHECK] KAKAO_CLIENT_ID  = {}", kakaoClientId);
    }
}
