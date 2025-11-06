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
            // mode 파라미터 확인 (link 모드인지 확인)
            String mode = request.getParameter("mode");
            boolean isLinkMode = "link".equals(mode);
            
            Object principal = authentication.getPrincipal();

            String email = null;
            String role = "USER";
            String provider = null;
            String providerUserId = null;

            if (principal instanceof CustomOAuth2User cu) {
                email = cu.getEmail();
                role = cu.getRole();
                provider = extractProvider(request);
                providerUserId = extractProviderUserId(cu, provider);
            } else if (principal instanceof OidcUser oidc) {
                // 구글 OIDC
                email = oidc.getEmail();
                provider = "google";
                providerUserId = oidc.getSubject(); // Google unique ID
            } else if (principal instanceof OAuth2User ou) {
                Object v = ou.getAttributes().get("email");
                email = v == null ? null : v.toString();
                provider = extractProvider(request);
                providerUserId = extractProviderUserIdFromAttributes(ou, provider);
            }

            Users user = (email != null) ? userRepository.findByEmail(email) : null;
            if (user != null && user.getRole() != null) {
                role = user.getRole().name(); // DB 기준으로 보정
            }

            boolean needProfile = (user == null)
                    || isBlank(user.getName())
                    || isBlank(user.getPhone());

            String token = jwtTokenService.createToken(email, role, HOUR);

            log.info("OAuth2 SUCCESS email={}, role={}, needProfile={}, mode={}, provider={}", 
                    email, role, needProfile, mode, provider);

            // link 모드: provider 정보만 전달
            if (isLinkMode) {
                response.setContentType("text/html;charset=UTF-8");
                response.getWriter().write("""
<!doctype html>
<html><body>
<script>
  (function () {
    try {
      const data = {
        mode: "link",
        provider: "%s",
        provider_user_id: "%s",
        email: "%s"
      };
      if (window.opener) {
        window.opener.postMessage(data, "*");
        console.log('[OAuth2SuccessHandler] link mode postMessage sent', data);
      } else {
        console.warn('[OAuth2SuccessHandler] no opener window');
      }
    } catch (e) {
      console.error('[OAuth2SuccessHandler] postMessage error', e);
    }
    setTimeout(function(){ try { window.close(); } catch(e){} }, 300);
  })();
</script>
</body></html>
""".formatted(
                        js(provider),
                        js(providerUserId),
                        js(email)
                ));
                return;
            }

            // 일반 로그인 모드
            String userJson = (user != null)
                    ? "{\"role\":\"" + js(role) + "\"," +
                    "\"email\":\"" + js(nullToEmpty(user.getEmail())) + "\"," +
                    "\"name\":\"" + js(nullToEmpty(user.getName())) + "\"," +
                    "\"phone\":\"" + js(nullToEmpty(user.getPhone())) + "\"}"
                    : "null";

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
      if (window.opener) {
        window.opener.postMessage(data, "*");
        console.log('[OAuth2SuccessHandler] login mode postMessage sent', data);
      } else {
        console.warn('[OAuth2SuccessHandler] no opener window');
      }
    } catch (e) {
      console.error('[OAuth2SuccessHandler] postMessage error', e);
    }
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

    /** Request URI에서 provider 추출 */
    private String extractProvider(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri.contains("/google")) return "google";
        if (uri.contains("/naver")) return "naver";
        if (uri.contains("/kakao")) return "kakao";
        return "unknown";
    }

    /** CustomOAuth2User에서 provider user ID 추출 */
    private String extractProviderUserId(CustomOAuth2User user, String provider) {
        // CustomOAuth2User에 providerId getter가 있다면 사용
        // 없으면 email 사용
        return user.getEmail();
    }

    /** OAuth2User attributes에서 provider user ID 추출 */
    private String extractProviderUserIdFromAttributes(OAuth2User user, String provider) {
        switch (provider.toLowerCase()) {
            case "google":
                Object sub = user.getAttributes().get("sub");
                return sub != null ? sub.toString() : user.getAttributes().get("email").toString();
            case "naver":
                Object naverResponse = user.getAttributes().get("response");
                if (naverResponse instanceof java.util.Map) {
                    Object id = ((java.util.Map<?, ?>) naverResponse).get("id");
                    return id != null ? id.toString() : user.getAttributes().get("email").toString();
                }
                break;
            case "kakao":
                Object kakaoId = user.getAttributes().get("id");
                return kakaoId != null ? kakaoId.toString() : user.getAttributes().get("email").toString();
        }
        // fallback: email
        Object email = user.getAttributes().get("email");
        return email != null ? email.toString() : "unknown";
    }
}