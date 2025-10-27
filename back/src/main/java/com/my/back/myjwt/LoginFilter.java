package com.my.back.myjwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.my.back.dto.CustomUserDetails;
import com.my.back.dto.LoginRequest;
import com.my.back.service.JwtTokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;

@RequiredArgsConstructor
public class LoginFilter extends UsernamePasswordAuthenticationFilter implements SessionTime {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService; // ✅ 수정됨

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            LoginRequest loginRequest = objectMapper.readValue(request.getInputStream(), LoginRequest.class);

            String email = loginRequest.getEmail();
            String password = loginRequest.getPassword();

            System.out.println("🟢 로그인 시도: " + email);

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(email, password, null);

            return authenticationManager.authenticate(authToken);

        } catch (IOException e) {
            throw new RuntimeException("로그인 요청 파싱 실패", e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain chain,
                                            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String userEmail = userDetails.getEmail();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        String role = iterator.hasNext() ? iterator.next().getAuthority() : "ROLE_USER";

        // ✅ JwtTokenService 기반으로 토큰 생성
        String token = jwtTokenService.createToken(userEmail, role, HOUR * 10L);

        response.addHeader("Authorization", "Bearer " + token);
        response.setStatus(HttpServletResponse.SC_OK);

        System.out.println("✅ 로그인 성공 - JWT 발급 완료: " + userEmail);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request,
                                              HttpServletResponse response,
                                              AuthenticationException failed) {
        System.out.println("❌ 로그인 실패 - 이유: " + failed.getMessage());
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }
}
