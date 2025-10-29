package com.my.back.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class OAuth2FailureHandler implements AuthenticationFailureHandler {
    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException ex) throws IOException {
        log.error("OAuth2 FAILURE: {}", ex.getMessage(), ex);
        response.setContentType("text/html;charset=UTF-8");
        response.getWriter().write("""
          <html><body>
          <script>
            try {
              const payload = { error: true, message: %s };
              const targets = ["http://localhost:3000", "https://proteinfriends.shop"];
              targets.forEach(o => { try { window.opener.postMessage(payload, o); } catch(e){} });
            } catch(e) {}
            window.close();
          </script>
          </body></html>
        """.formatted(js(ex.getMessage())));
    }
    private static String js(String s) {
        if (s == null) return "\"\"";
        return "\"" + s.replace("\\","\\\\").replace("\"","\\\"") + "\"";
    }
}