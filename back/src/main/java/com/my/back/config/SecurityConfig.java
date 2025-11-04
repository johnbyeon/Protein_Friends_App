package com.my.back.config;

import com.my.back.myjwt.JWTFilter;
import com.my.back.myjwt.LoginFilter;
import com.my.back.oauth2.OAuth2SuccessHandler;
import com.my.back.repository.UserRepository;
import com.my.back.service.CustomUserDetailsService;
import com.my.back.service.JwtTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse; // ✅ (내 코드 추가)
import java.util.List;

@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenService jwtTokenService;
    private final UserRepository userRepository;
    private final CustomUserDetailsService customUserDetailsService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final JWTFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder builder = http.getSharedObject(AuthenticationManagerBuilder.class);
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        builder.authenticationProvider(provider);
        return builder.build();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationManager authManager) throws Exception {
        log.info("✅ SecurityFilterChain initialized — filter order starting...");

        // 폼 로그인 엔드포인트를 /api로 고정 (프론트 /login 과 충돌 방지)
        LoginFilter loginFilter = new LoginFilter(authManager, jwtTokenService, userRepository);
        loginFilter.setFilterProcessesUrl("/api/auth/login");

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // ===== 🔽 여기부터가 '내 코드' 추가분 🔽 =====
                .formLogin(fl -> fl.disable())          // ✅ 브라우저 폼 로그인 비활성
                .httpBasic(hb -> hb.disable())          // ✅ HTTP Basic 비활성
                .exceptionHandling(eh -> eh             // ✅ 401 JSON으로 고정 (302 방지)
                        .authenticationEntryPoint((req, res, ex) -> {
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"error\":\"unauthorized\"}");
                        })
                )
                // ===== 🔼 여기까지 '내 코드' 추가분 🔼 =====

                .authorizeHttpRequests(auth -> auth
                        // 비인증 허용
                        .requestMatchers(HttpMethod.POST, "/api/auth/oauth2/login", "/api/auth/login", "/api/auth/join").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/board-types", "/api/board-types/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/branches", "/api/branches/*", "/api/branches/*/trainers").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users/search").permitAll()
                        .requestMatchers(
                                "/oauth2/**",
                                "/login/oauth2/**",           // 콜백
                                "/actuator/health",
                                "/error"
                        ).permitAll()
                        // 관리자/트레이너 전용 (게시판 관리)
                        .requestMatchers("/api/admin/boards/**").hasAnyRole("ADMIN", "TRAINER")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // 트레이너 전용
                        .requestMatchers("/api/trainer/**").hasRole("TRAINER")
                        // 그 외는 인증 필요
                        .anyRequest().authenticated()
                )

                // ✅ 스프링 기본 /login 안 쓰도록 로그인 페이지 경로 분리
                .oauth2Login(o -> o
                        .loginPage("/api/auth/oauth2/login") // 프론트 /login 과 충돌 방지용 더미 경로
                        .authorizationEndpoint(a -> a.baseUri("/oauth2/authorization"))
                        .redirectionEndpoint(r -> r.baseUri("/login/oauth2/code/*"))
                        .successHandler(oAuth2SuccessHandler)
                )

                // 필터 체인
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAt(loginFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://localhost:3000",
                "https://proteinfriends.shop",
                "https://www.proteinfriends.shop"
        ));
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        c.setExposedHeaders(List.of("Authorization","Set-Cookie"));
        c.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", c);
        return src;
    }
}
