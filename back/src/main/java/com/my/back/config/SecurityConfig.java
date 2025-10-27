package com.my.back.config;

import com.my.back.myjwt.JWTFilter;
import com.my.back.myjwt.LoginFilter;
import com.my.back.oauth2.OAuth2SuccessHandler;
import com.my.back.service.CustomOAuth2UserService;
import com.my.back.service.JwtTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.annotation.web.configurers.FormLoginConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final JwtTokenService jwtTokenService; // ✅ JwtTokenService로 통일
    private final AuthenticationConfiguration authenticationConfiguration;
    private final CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(CsrfConfigurer::disable);
        http.formLogin(FormLoginConfigurer::disable);

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/join", "/oauth2/**").permitAll()
                .requestMatchers("/admin").hasRole("ADMIN")
                .anyRequest().authenticated()
        );

        // ✅ JwtTokenService 기반으로 필터 등록
        http.addFilterBefore(new JWTFilter(jwtTokenService), UsernamePasswordAuthenticationFilter.class);
        http.addFilterAt(
                new LoginFilter(authenticationManager(authenticationConfiguration), jwtTokenService),
                UsernamePasswordAuthenticationFilter.class
        );

        http.oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler(oAuth2SuccessHandler)
        );

        return http.build();
    }
}
