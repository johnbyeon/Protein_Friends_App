package com.my.back.oauth2;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class OAuth2LoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        // OAuth2 Redirect URL 확인용
        if (uri.startsWith("/login/oauth2/code/")) {
            String provider = uri.substring(uri.lastIndexOf("/") + 1);
            String code = request.getParameter("code");
            String state = request.getParameter("state");
            log.info("🔐 OAuth2 callback 도착: provider={}, code={}, state={}", provider, code, state);
        }

        filterChain.doFilter(request, response);
    }
}
