package com.my.back.myjwt;

import com.my.back.dto.CustomUserDetails;
import com.my.back.entity.UserRole;
import com.my.back.entity.Users;
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
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@RequiredArgsConstructor
@Slf4j
public class JWTFilter extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService; // ✅ 수정됨

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws IOException, ServletException {

        String authorization = request.getHeader("Authorization");

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorization.substring(7);

        if (jwtTokenService.isExpired(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        String userEmail = jwtTokenService.extractEmail(token);
        String role = jwtTokenService.extractRole(token);

        Users users = new Users();
        users.setEmail(userEmail);
        users.setUserRole(UserRole.USER);

        CustomUserDetails userDetails = new CustomUserDetails(users);
        Authentication authToken = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }
}
