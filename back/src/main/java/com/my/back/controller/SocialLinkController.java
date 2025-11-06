package com.my.back.controller;

import com.my.back.dto.SocialLinkRequest;
import com.my.back.entity.Users;
import com.my.back.repository.UserRepository;
import com.my.back.service.SocialAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 소셜 계정 연결 전용 Controller
 * - 이미 로그인된 사용자가 추가 소셜 계정을 연결하는 기능
 */
@RestController
@RequestMapping("/api/users/me/social")
@RequiredArgsConstructor
@Slf4j
public class SocialLinkController {

    private final UserRepository userRepository;
    private final SocialAccountService socialAccountService;

    /**
     * 소셜 계정 연결 (OAuth 정보 포함)
     * POST /api/users/me/social/link
     */
    @PostMapping("/link")
    public ResponseEntity<?> linkSocialAccount(
            @AuthenticationPrincipal(expression = "username") String email,
            @RequestBody SocialLinkRequest request
    ) {
        try {
            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증이 필요합니다.");
            }

            Users user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사용자를 찾을 수 없습니다.");
            }

            socialAccountService.linkSocialAccount(user.getUId(), request);

            log.info("{} 계정 연결 성공: {}", request.getProvider(), email);
            return ResponseEntity.ok(request.getProvider() + " 계정이 연결되었습니다.");
        } catch (IllegalStateException e) {
            log.warn("{} 계정 연결 실패: {}", request.getProvider(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("{} 계정 연결 실패: {}", request.getProvider(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(request.getProvider() + " 계정 연결 중 오류가 발생했습니다.");
        }
    }

    /**
     * 소셜 계정 연결 해제
     * DELETE /api/users/me/social/{provider}
     */
    @DeleteMapping("/{provider}")
    public ResponseEntity<?> unlinkSocialAccount(
            @AuthenticationPrincipal(expression = "username") String email,
            @PathVariable String provider
    ) {
        try {
            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증이 필요합니다.");
            }

            Users user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사용자를 찾을 수 없습니다.");
            }

            socialAccountService.unlinkSocialAccount(user.getUId(), provider);

            log.info("{} 계정 연결 해제 성공: {}", provider, email);
            return ResponseEntity.ok(provider + " 계정 연결이 해제되었습니다.");
        } catch (IllegalStateException e) {
            log.warn("{} 계정 연결 해제 실패: {}", provider, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("{} 계정 연결 해제 실패: {}", provider, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(provider + " 계정 연결 해제 중 오류가 발생했습니다.");
        }
    }
}

