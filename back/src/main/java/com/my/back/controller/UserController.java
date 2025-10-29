package com.my.back.controller;

import com.my.back.entity.Users;
import com.my.back.repository.UserRepository;
import com.my.back.dto.UserProfileUpdateRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

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
        return ResponseEntity.ok(user);
    }
}