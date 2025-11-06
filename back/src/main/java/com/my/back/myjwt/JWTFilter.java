package com.my.back.myjwt;

import com.my.back.dto.CustomUserDetails;
import com.my.back.entity.UserRole;
import com.my.back.entity.Users;
import com.my.back.repository.UserRepository;
import com.my.back.service.JwtTokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JWTFilter extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService;
    private final UserRepository userRepository;
    private boolean shouldBypass(HttpServletRequest request) {
        String p = request.getRequestURI();
        return p.startsWith("/api/auth/login")
                || p.startsWith("/api/auth/join")
                || p.startsWith("/oauth2/authorization")   // ✅ 소셜 로그인 진입
                || p.startsWith("/login/oauth2/code")       // ✅ 소셜 로그인 콜백
                || p.startsWith("/oauth2/callback")         // ✅ 혹시 커스텀 리다이렉트 있을 경우
                || p.equals("/error")
                || p.startsWith("/actuator");
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws IOException, ServletException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        // ✅ 로그인, 회원가입, OAuth 요청은 JWT 인증 무시
        if (shouldBypass(request)) {
            log.info("[JWTFilter] ⏩ Bypass URI: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }


        log.info("➡️ [JWTFilter] {} {}", method, path);
        String authorization = request.getHeader("Authorization");
        log.info("🔍 Authorization Header = {}", authorization);

        // 1️⃣ Authorization 헤더 없거나 Bearer 로 시작 안하면 패스
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            log.warn("🚫 [JWTFilter] Authorization 헤더 누락 or 형식 오류");
            filterChain.doFilter(request, response);
            return;
        }

        // 2️⃣ Bearer 제거 후 토큰 추출
        String token = authorization.substring(7).trim();
        log.info("🔹 [JWTFilter] Token = {}", token);
        try {
            boolean expired = jwtTokenService.isExpired(token);
            log.info("🔹 [JWTFilter] Token 만료 여부 = {}", expired);
            if (expired) {
                log.warn("⚠️ [JWTFilter] JWT 만료됨");
                filterChain.doFilter(request, response);
                return;
            }

            // 4️⃣ 이메일 추출
            String email = jwtTokenService.extractEmail(token);
            String role  = jwtTokenService.extractRole(token);
            log.info("🔹 [JWTFilter] 추출된 클레임 → email={}, role={}", email, role);

            if (email == null) {
                log.error("❌ [JWTFilter] email 클레임 누락됨");
                filterChain.doFilter(request, response);
                return;
            }

            // ✅ 1️⃣ Users 객체 생성 (DB에서 최신 정보로 사용)
            Users user = userRepository.findByEmail(email);
            if (user == null) {
                log.error("❌ [JWTFilter] User not found in database: {}", email);
                filterChain.doFilter(request, response);
                return;
            }
            log.info("🔹 [JWTFilter] Found user in DB - email={}, role={}", user.getEmail(), user.getRole());

            // ✅ 2️⃣ CustomUserDetails로 감싸기
            CustomUserDetails userDetails = new CustomUserDetails(user);
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);

            log.info("✅ [JWTFilter] SecurityContext 세팅 완료 - Principal={}",
                    SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        } catch (Exception e) {
            log.error("❌ JWT 필터 처리 중 오류", e);
        }

        // 6️⃣ 다음 필터로 전달
        filterChain.doFilter(request, response);
        // ✅ 이 부분이 "필터 끝난 뒤" 상태를 확인하는 로그
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("🟢 [JWTFilter] 필터 종료 후 Authentication 존재 여부: {}", (auth != null));
        if (auth != null)
            log.info("🟢 [JWTFilter] Principal 타입: {}, 값: {}",
                    auth.getPrincipal().getClass().getSimpleName(),
                    auth.getPrincipal());
    }
}