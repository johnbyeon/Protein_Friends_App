package com.my.back.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * JwtTokenService.extractRole(..) 결과를 표준 Enum명("USER","ADMIN" 등)으로 정규화.
 * - 입력이 "ROLE_USER", "user", " role_admin " 등이어도 항상 "USER"/"ADMIN" 반환
 * - null/이상치 → "USER" 폴백
 * - 팀장 JWTFilter는 수정 없이 그대로 사용 가능
 */
@Slf4j
@Aspect
@Component
public class RoleNormalizationAspect {

    // JwtTokenService.extractRole(String token)를 가로채어 결과를 정규화
    @Around("execution(* com.my.back.service.JwtTokenService.extractRole(..))")
    public Object normalizeExtractRole(ProceedingJoinPoint pjp) throws Throwable {
        Object ret;
        try {
            ret = pjp.proceed();
        } catch (Throwable t) {
            log.warn("⚠️ extractRole() 예외 → 기본 USER로 대체", t);
            return "USER";
        }
        String raw = (ret == null) ? null : ret.toString();
        String normalized = toEnumName(raw);
        log.debug("🔁 role normalize: raw='{}' → normalized='{}'", raw, normalized);
        return normalized; // "USER","ADMIN","MANAGER" 등
    }

    // "ROLE_user" / "user" / " role_admin " / null → "USER" | "ADMIN" | (기본 USER)
    private String toEnumName(String raw) {
        if (raw == null || raw.isBlank()) return "USER";
        String r = raw.trim().toUpperCase();
        if (r.startsWith("ROLE_")) r = r.substring(5);
        switch (r) {
            case "USER":
            case "ADMIN":
            case "MANAGER":
                return r;
            default:
                return "USER";
        }
    }
}
