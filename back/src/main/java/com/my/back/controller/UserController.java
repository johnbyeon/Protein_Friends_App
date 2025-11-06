package com.my.back.controller;

import com.my.back.dto.PasswordChangeRequest;
import com.my.back.dto.UserBasicResponse;
import com.my.back.dto.UserInfoResponse;
import com.my.back.dto.UserInfoUpdateRequest;
import com.my.back.entity.Users;
import com.my.back.repository.UserRepository;
import com.my.back.dto.UserProfileUpdateRequest;
import com.my.back.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    /**
     * ✅ 프로필 업데이트 (소셜 로그인 이후 이름/전화번호 입력)
     */
    @PatchMapping("/profile")
    @Transactional
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal(expression = "username") String email,
            @RequestBody UserProfileUpdateRequest req
    ) {
        if (email == null) {
            return ResponseEntity.status(401).body("인증이 필요합니다.");
        }

        Users user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).body("유저를 찾을 수 없습니다.");
        }

        user.setName(req.getName());
        user.setPhone(req.getPhone());
        userRepository.save(user);

        return ResponseEntity.ok(user);
    }
    @GetMapping("/profile-status")
    public ResponseEntity<?> getProfileStatus(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        if (email == null) return ResponseEntity.status(401).body("인증이 필요합니다.");

        Users user = userRepository.findByEmail(email);
        if (user == null) return ResponseEntity.status(404).body("유저를 찾을 수 없습니다.");

        boolean profileRequired =
                user.getName() == null || user.getName().isBlank()
                        || user.getPhone() == null || user.getPhone().isBlank();

        return ResponseEntity.ok(java.util.Map.of(
                "profileRequired", profileRequired,
                "missing", new String[]{
                        (user.getName() == null || user.getName().isBlank()) ? "name" : null,
                        (user.getPhone() == null || user.getPhone().isBlank()) ? "phone" : null
                }
        ));
    }
    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal(expression = "username") String email) {
        if (email == null) return ResponseEntity.status(401).body("인증이 필요합니다.");
        Users user = userRepository.findByEmail(email);
        if (user == null) return ResponseEntity.status(404).body("유저를 찾을 수 없습니다.");
        
        // DTO로 변환하여 반환 (순환 참조 방지)
        UserBasicResponse response = UserBasicResponse.builder()
                .uId(user.getUId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .profilePicture(user.getProfilePicture())
                .googleLinked(user.isGoogleLinked())
                .naverLinked(user.isNaverLinked())
                .kakaoLinked(user.isKakaoLinked())
                .createAt(user.getCreateAt())
                .updateAt(user.getUpdateAt())
                .build();
        
        return ResponseEntity.ok(response);
    }

    /**
     * ✅ 사용자 상세 정보 조회 (Users + UserInfo 통합)
     * GET /api/users/me/detail
     */
    @GetMapping("/me/detail")
    public ResponseEntity<?> getMyDetailInfo(@AuthenticationPrincipal(expression = "username") String email) {
        try {
            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증이 필요합니다.");
            }

            Users user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("유저를 찾을 수 없습니다.");
            }

            UserInfoResponse userInfo = userService.getUserDetailInfo(user.getUId());
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            log.error("사용자 정보 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("사용자 정보 조회 중 오류가 발생했습니다.");
        }
    }

    /**
     * ✅ 사용자 정보 수정 (Users + UserInfo 통합)
     * PUT /api/users/me/info
     */
    @PutMapping("/me/info")
    @Transactional
    public ResponseEntity<?> updateMyInfo(
            @AuthenticationPrincipal(expression = "username") String email,
            @RequestBody UserInfoUpdateRequest request
    ) {
        try {
            log.info("✏️ [PUT] /api/users/me/info - 사용자 정보 수정 요청");
            log.info("📧 이메일: {}", email);
            log.info("📦 요청 데이터: {}", request);
            
            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증이 필요합니다.");
            }

            Users user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("유저를 찾을 수 없습니다.");
            }

            log.info("👤 사용자 ID: {}", user.getUId());
            
            UserInfoResponse updatedInfo = userService.updateUserInfo(user.getUId(), request);
            log.info("✅ 사용자 정보 수정 완료");
            return ResponseEntity.ok(updatedInfo);
        } catch (Exception e) {
            log.error("❌ 사용자 정보 수정 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("사용자 정보 수정 중 오류가 발생했습니다.");
        }
    }

    /**
     * ✅ 유저 검색 (이름 또는 이메일로 검색)
     * GET /api/users/search?q=검색어
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam(name = "q", required = false) String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("검색어를 입력하세요.");
        }

        var users = userService.searchUsers(query);
        return ResponseEntity.ok(users);
    }

    /**
     * ✅ 비밀번호 변경
     * PUT /api/users/me/password
     */
    @PutMapping("/me/password")
    @Transactional
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal(expression = "username") String email,
            @RequestBody PasswordChangeRequest request
    ) {
        try {
            log.info("🔐 [PUT] /api/users/me/password - 비밀번호 변경 요청");
            log.info("📧 이메일: {}", email);
            
            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증이 필요합니다.");
            }

            Users user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("유저를 찾을 수 없습니다.");
            }

            // 현재 비밀번호 확인
            if (user.getPassword() == null || !bCryptPasswordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                log.warn("⚠️ 현재 비밀번호 불일치");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("현재 비밀번호가 일치하지 않습니다.");
            }

            // 새 비밀번호 검증
            if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("새 비밀번호는 최소 8자 이상이어야 합니다.");
            }

            // 비밀번호 변경
            user.setPassword(bCryptPasswordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            
            log.info("✅ 비밀번호 변경 완료");
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } catch (Exception e) {
            log.error("❌ 비밀번호 변경 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("비밀번호 변경 중 오류가 발생했습니다.");
        }
    }
}