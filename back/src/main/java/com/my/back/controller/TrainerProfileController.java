package com.my.back.controller;

import com.my.back.dto.CustomUserDetails;
import com.my.back.dto.TrainerProfileResponse;
import com.my.back.dto.TrainerProfileUpdateRequest;
import com.my.back.dto.UserDTO;
import com.my.back.service.TrainerService;
import com.my.back.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 트레이너 본인 프로필 관리 Controller
 * - TRAINER 권한 필요
 * - 본인 정보만 조회/수정 가능
 */
@RestController
@RequestMapping("/api/trainer")
@RequiredArgsConstructor
public class TrainerProfileController {

    private final TrainerService trainerService;
    private final UserService userService;

    /**
     * 트레이너 본인 프로필 조회
     * GET /api/trainer/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }

            // 이메일로 사용자 정보 조회
            String email = userDetails.getUsername();
            UserDTO user = userService.getUserByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("사용자를 찾을 수 없습니다.");
            }

            // 트레이너 정보 조회
            TrainerProfileResponse profile = trainerService.getMyProfile(user.getUId());
            return ResponseEntity.ok(profile);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("프로필 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 트레이너 본인 프로필 수정
     * PUT /api/trainer/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody TrainerProfileUpdateRequest request) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }

            // 이메일로 사용자 정보 조회
            String email = userDetails.getUsername();
            UserDTO user = userService.getUserByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("사용자를 찾을 수 없습니다.");
            }

            // 트레이너 정보 수정
            TrainerProfileResponse profile = trainerService.updateMyProfile(user.getUId(), request);
            return ResponseEntity.ok(profile);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("프로필 수정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}

