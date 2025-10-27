package com.my.back.oauth2;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.my.back.dto.CustomOAuth2User;
import com.my.back.myjwt.SessionTime;
import com.my.back.myjwt.JWTUtil;
import com.my.back.service.JwtTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;


@RequiredArgsConstructor
@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler, SessionTime {

    private final JwtTokenService jwtTokenService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        CustomOAuth2User oauthUser = (CustomOAuth2User) authentication.getPrincipal();
        String email = oauthUser.getEmail();
        String role = oauthUser.getRole();

        String jwtToken = jwtTokenService.createToken(email, role, HOUR);

        response.setContentType("text/html;charset=UTF-8");
        PrintWriter writer = response.getWriter();
        writer.println("<html><body>");
        writer.println("<script>");
        writer.println("window.opener.postMessage('" + jwtToken + "', 'http://localhost:3000');");
        writer.println("window.close();");
        writer.println("</script>");
        writer.println("</body></html>");
    }
}

