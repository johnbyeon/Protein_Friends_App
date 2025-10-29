package com.my.back.myjwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.my.back.entity.Users;
import com.my.back.repository.UserRepository;
import com.my.back.service.JwtTokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
@Slf4j
public class LoginFilter extends UsernamePasswordAuthenticationFilter implements SessionTime {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final JwtTokenService jwtTokenService;
    private final UserRepository userRepository;

    public LoginFilter(AuthenticationManager authenticationManager,
                       JwtTokenService jwtTokenService,
                       UserRepository userRepository) {
        this.jwtTokenService = Objects.requireNonNull(jwtTokenService);
        this.userRepository = Objects.requireNonNull(userRepository);
        // ★ 부모 필터에 AuthenticationManager 주입 (NPE 방지)
        super.setAuthenticationManager(Objects.requireNonNull(authenticationManager));
        // ★ 프런트가 호출하는 엔드포인트와 일치시킴
        super.setFilterProcessesUrl("/api/auth/login");
    }

    /** JSON { "email": "...", "password": "..." } 파싱해서 인증 요청 */
    @Override
    public org.springframework.security.core.Authentication attemptAuthentication(
            HttpServletRequest request, HttpServletResponse response) {
        log.info("🟢 [LoginFilter] attemptAuthentication() 진입");
        log.info("🟢 요청 URL: {}", request.getRequestURI());
        log.info("🟢 Content-Type: {}", request.getContentType());
        log.info("🟢 메서드: {}", request.getMethod());
        try {
            String contentType = request.getContentType();
            String email;
            String password;

            if (contentType != null && contentType.toLowerCase().contains("application/json")) {
                LoginRequest body = objectMapper.readValue(request.getInputStream(), LoginRequest.class);
                email = body.email == null ? "" : body.email.trim();
                password = body.password == null ? "" : body.password;
            } else {
                // 폼 전송도 허용 (username 파라미터 대신 email 사용)
                email = StringUtils.hasText(request.getParameter("email")) ? request.getParameter("email") : "";
                password = StringUtils.hasText(request.getParameter("password")) ? request.getParameter("password") : "";
            }

            if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
                throw new BadCredentialsException("이메일/비밀번호를 확인해주세요.");
            }

            UsernamePasswordAuthenticationToken authRequest =
                    new UsernamePasswordAuthenticationToken(email, password);
            setDetails(request, authRequest);

            return this.getAuthenticationManager().authenticate(authRequest);
        } catch (IOException e) {
            throw new RuntimeException("로그인 요청 파싱 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain chain,
                                            org.springframework.security.core.Authentication authResult) throws IOException {
        log.info("🟢 [LoginFilter] successfulAuthentication() 진입");
        log.info("🟢 인증 성공: {}", authResult.getName());

        String email = authResult.getName();
        String role = authResult.getAuthorities().iterator().next().getAuthority();
        log.info("🟢 successfulAuthentication role : {}", role);

        // 1️⃣ "ROLE_"로 시작하는지 확인
        if (role != null && role.startsWith("ROLE_")) {
            // 2️⃣ "ROLE_" 부분 제거 → "USER"
            role = role.substring(5);
        }
        // JWT 생성
        String token = jwtTokenService.createToken(email, role, HOUR);
        int expiresInSec = (int) (HOUR / 1000);

        // 유저 조회 및 프로필 여부 판단
        Users user = userRepository.findByEmail(email);
        boolean needProfile = user == null
                || !StringUtils.hasText(user.getName())
                || !StringUtils.hasText(user.getPhone());

        // 응답 JSON 구성
        Map<String, Object> userJson = new HashMap<>();
        userJson.put("email", email);
        userJson.put("role", role);
        userJson.put("name", user != null ? user.getName() : null);
        userJson.put("phone", user != null ? user.getPhone() : null);

        Map<String, Object> payload = new HashMap<>();
        payload.put("access_token", token);
        payload.put("expires_in", expiresInSec);
        payload.put("user", userJson);
        payload.put("need_profile", needProfile);

        // 🔍 디버깅용 로그 (JSON 그대로 확인)
        String jsonResponse = objectMapper.writeValueAsString(payload);
        log.info("[LoginFilter] email={} name='{}' phone='{}' => needProfile={}",
                user != null ? user.getEmail() : null,
                user != null ? user.getName() : null,
                user != null ? user.getPhone() : null,
                needProfile);
        log.info("🟩 [LoginFilter] 최종 응답 JSON = {}", jsonResponse);

        // ✅ 헤더 및 JSON 응답 설정
        response.setStatus(HttpServletResponse.SC_OK);
        response.setHeader("Authorization", "Bearer " + token);
        response.setContentType("application/json;charset=UTF-8");

        try (PrintWriter out = response.getWriter()) {
            out.write(jsonResponse);
            out.flush(); // 👈 중요: JSON 전송 완료 보장
        }
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request,
                                              HttpServletResponse response,
                                              org.springframework.security.core.AuthenticationException failed)
            throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        try (PrintWriter out = response.getWriter()) {
            Map<String, Object> err = Map.of("error", "아이디 또는 비밀번호가 올바르지 않습니다.");
            out.print(objectMapper.writeValueAsString(err));
        }
    }

    /** JSON 바디 파싱용 레코드 */
    public static final class LoginRequest {
        public String email;
        public String password;
        public LoginRequest() {}
    }
}