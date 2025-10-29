package com.my.back.oauth2;

import com.my.back.dto.CustomOAuth2User;
import com.my.back.entity.Users;
import com.my.back.myjwt.SessionTime;
import com.my.back.repository.UserRepository;
import com.my.back.service.JwtTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler, SessionTime {

    private final JwtTokenService jwtTokenService;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            Object principal = authentication.getPrincipal();

            String email = null;
            String role = "USER";

            if (principal instanceof CustomOAuth2User cu) {
                email = cu.getEmail();
                role = cu.getRole();
            } else if (principal instanceof OidcUser oidc) {
                // 구글 OIDC
                email = oidc.getEmail();
            } else if (principal instanceof OAuth2User ou) {
                Object v = ou.getAttributes().get("email");
                email = v == null ? null : v.toString();
            }

            Users user = (email != null) ? userRepository.findByEmail(email) : null;
            if (user != null && user.getRole() != null) {
                role = user.getRole().name(); // DB 기준으로 보정
            }

            boolean needProfile = (user == null)
                    || isBlank(user.getName())
                    || isBlank(user.getPhone());

            String token = jwtTokenService.createToken(email, role, HOUR);

            log.info("OAuth2 SUCCESS email={}, role={}, needProfile={}", email, role, needProfile);

            String userJson = (user != null)
                    ? "{\"role\":\"" + js(role) + "\"," +
                    "\"email\":\"" + js(nullToEmpty(user.getEmail())) + "\"," +
                    "\"name\":\"" + js(nullToEmpty(user.getName())) + "\"," +
                    "\"phone\":\"" + js(nullToEmpty(user.getPhone())) + "\"}"
                    : "null";

            // 팝업이 postMessage로 프론트에 토큰 전달
            response.setContentType("text/html;charset=UTF-8");
            response.getWriter().write("""
<!doctype html>
<html><body>
<script>
  (function () {
    try {
      const data = {
        access_token: "%s",
        expires_in: %d,
        need_profile: %s,
        user: %s
      };
      // *** 핵심 수정: 오리진 고정 대신 "*" 로 전송 (일단 동작 우선)
      if (window.opener) {
        window.opener.postMessage(data, "*");
        console.log('[OAuth2SuccessHandler] postMessage sent (*)', data);
      } else {
        console.warn('[OAuth2SuccessHandler] no opener window');
      }
    } catch (e) {
      console.error('[OAuth2SuccessHandler] postMessage error', e);
    }
    // 팝업 닫기
    setTimeout(function(){ try { window.close(); } catch(e){} }, 300);
  })();
</script>
</body></html>
""".formatted(
                    js(token),
                    (int) (HOUR / SECOND),
                    needProfile ? "true" : "false",
                    userJson
            ));

        } catch (Exception e) {
            log.error("OAuth2 success handling failed", e);
            response.sendError(500, "OAuth2 success handling failed");
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    /** JS 문자열 이스케이프 */
    private static String js(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}