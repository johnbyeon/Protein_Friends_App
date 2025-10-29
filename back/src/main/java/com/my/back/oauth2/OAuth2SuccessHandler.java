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
    private final UserRepository userRepository; // ✅ role을 DB에서 보정하기 위해 주입

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            Object p = authentication.getPrincipal();

            String email = null;
            String role  = "USER";

            if (p instanceof CustomOAuth2User cu) {
                email = cu.getEmail();
                role  = cu.getRole();
            } else if (p instanceof OidcUser oidc) {
                email = oidc.getEmail(); // 구글 OIDC
            } else if (p instanceof OAuth2User ou) {
                Object v = ou.getAttributes().get("email");
                email = (v == null) ? null : v.toString();
            }

            Users user = (email != null) ? userRepository.findByEmail(email) : null;
            if (user != null && user.getRole() != null) {
                role = user.getRole().name();
            }

            boolean needProfile = (user == null) ||
                    (user.getName()==null || user.getName().isBlank()) ||
                    (user.getPhone()==null || user.getPhone().isBlank());
            log.info("[LoginFilter] email={} name={} phone={} => needProfile={}",
                    user != null ? user.getEmail() : null,
                    user != null ? user.getName() : null,
                    user != null ? user.getPhone() : null,
                    needProfile);

            String token = jwtTokenService.createToken(email, role, HOUR);
            log.info("OAuth2 SUCCESS email={}, role={}, needProfile={}", email, role, needProfile);

            // user 정보 JSON 문자열 생성 (null-safe)
            String userJson = user != null
                ? String.format("{\"role\":\"%s\",\"email\":\"%s\",\"name\":\"%s\",\"phone\":\"%s\"}",
                    js(role), js(user.getEmail()), js(user.getName()), js(user.getPhone()))
                : "null";

            response.setContentType("text/html;charset=UTF-8");
            response.getWriter().write("""
<html><body>
<script>
  try {
    const data = {
      access_token: "%s",
      expires_in: %d,
      need_profile: "%s",
      user: %s
    };
    if (window.opener) {
      // ✅ 오리진 일치하도록 지정
      window.opener.postMessage(data, window.opener.origin);
      console.log('[OAuth2SuccessHandler] postMessage sent to', window.opener.origin, data);
    }
  } catch (e) {
    console.error('[OAuth2SuccessHandler] error', e);
  }
  setTimeout(() => { try { window.close(); } catch(e){} }, 500);
</script>
</body></html>
""".formatted(
                    token,
                    (int)(HOUR/SECOND),
                    needProfile ? "true" : "false",
                    userJson
            ));

                } catch (Exception e) {
                    log.error("OAuth2 success handling failed", e);
                    response.sendError(500, "OAuth2 success handling failed");
                }
            }


            private String js(String s) {
                if (s == null) return "";
                return s.replace("\\","\\\\").replace("\"","\\\"");
            }
        }