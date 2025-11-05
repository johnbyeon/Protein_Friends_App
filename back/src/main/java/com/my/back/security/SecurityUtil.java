package com.my.back.security;

import com.my.back.dto.CustomUserDetails;
import com.my.back.exception.ApiException;
import com.my.back.exception.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * 로그인된 사용자 정보(SecurityContext)에서
 * 현재 로그인한 사용자 ID(uId)를 안전하게 가져오는 유틸 클래스
 *
 * ✅ CustomUserDetails 사용 환경
 * ✅ JWT + CustomUserDetails 기반 인증 구조에 최적화
 * ❌ 세션 + 다양한 인증 타입 혼합 환경은 아님 (필요 시 확장 가능)
 */
@Component
public class SecurityUtil {

    /**
     * 현재 로그인한 사용자의 uId를 반환
     *
     * @return 로그인한 사용자 uId
     * @throws ApiException UNAUTHORIZED (미로그인 or principal 이상)
     */
    public Long getLoginUserId() {

        // 시큐리티 컨텍스트에서 인증 객체 꺼내기
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // 인증 정보가 없거나 인증이 안 돼있으면 → 401
        if (auth == null || !auth.isAuthenticated()) {
            throw new ApiException(ErrorCode.UNAUTHORIZED);
        }

        // principal 꺼내기
        Object principal = auth.getPrincipal();

        // 우리가 만든 CustomUserDetails 로만 인증된 환경이므로
        // 타입 체크 후 아니면 바로 오류
        if (!(principal instanceof CustomUserDetails user)) {
            throw new ApiException(ErrorCode.UNAUTHORIZED);
        }

        // 최종적으로 uId 반환
        return user.getUId();
    }
}
