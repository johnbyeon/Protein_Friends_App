package com.my.back.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing  // ✅ 필수: @CreatedDate, @LastModifiedDate 활성화
public class JpaConfig {
}
