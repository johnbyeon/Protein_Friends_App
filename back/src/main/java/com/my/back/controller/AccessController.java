package com.my.back.controller;

import com.my.back.dto.*;
import com.my.back.entity.Users;
import com.my.back.repository.UserRepository;
import com.my.back.service.AccessService;
import com.my.back.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * ==============================================================
 * 🔹 AccessController - 출입 관리 API
 * ==============================================================
 * ✅ 엔드포인트
 *  GET  /api/access/locations        - 전체 지점 목록 조회 (현재 인원 포함)
 *  GET  /api/access/capacity/:gId    - 특정 지점 현재 인원 조회
 *  POST /api/access/entry            - 입장 처리
 *  POST /api/access/exit             - 퇴장 처리
 *
 * 📌 인증
 *  - JWT 인증 필수
 *  - @AuthenticationPrincipal 로 email 추출 → Users 조회 → uId 사용
 * ==============================================================
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/access")
public class AccessController {

    private final AccessService accessService;
    private final UserService userService;

    /**
     * 전체 지점 목록 조회 (현재 인원 포함)
     *
     * @return 지점 목록
     */
    @GetMapping("/locations")
    public ResponseEntity<List<GymLocationResponse>> getGymLocations() {
        log.info("전체 지점 목록 조회 요청");

        List<GymLocationResponse> locations = accessService.getAllGymLocationsWithCapacity();

        return ResponseEntity.ok(locations);
    }

    /**
     * 특정 지점의 현재 인원 조회
     *
     * @param gId 지점 번호
     * @return 현재 인원
     */
    @GetMapping("/capacity/{gId}")
    public ResponseEntity<Map<String, Object>> getCurrentCapacity(@PathVariable Long gId) {
        log.info("지점 {} 현재 인원 조회 요청", gId);

        try {
            Integer capacity = accessService.getCurrentCapacity(gId);

            return ResponseEntity.ok(Map.of(
                    "gId", gId,
                    "currentCapacity", capacity
            ));
        } catch (IllegalArgumentException e) {
            log.error("지점 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ActiveAccessDto> getActive(
            @AuthenticationPrincipal(expression = "username") String email) {

        if (email == null || email.isBlank()) {
            return ResponseEntity.status(401).build();
        }
        UserDTO user = userService.getUserByEmail(email.trim());
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(accessService.getActiveAccess(user.getUId()));
    }

    /**
     * 입장 처리 (IN)
     *
     * @param email 인증된 사용자 email
     * @param request 입장 요청 (지점 번호)
     * @return 입장 응답
     */
    @PostMapping("/entry")
    public ResponseEntity<?> processEntry(
            @AuthenticationPrincipal(expression = "username") String email,
            @RequestBody AccessRequest request
    ) {
        log.info("입장 요청 - email: {}, gId: {}", email, request.getGId());
        log.info("request : {}",request);
        // 1. 인증 확인
        if (email == null || email.isBlank()) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "인증 정보가 없습니다."));
        }
        if (request.getGId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "gId가 필요합니다."));
        }
        // 2. 사용자 조회
        UserDTO userDTO = userService.getUserByEmail(email.trim());

        if (userDTO == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "사용자를 찾을 수 없습니다."));
        }

        try {
            // 3. 입장 처리
            AccessResponse response = accessService.processEntry(userDTO.getUId(), request);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("입장 처리 실패 (입력 오류): {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (IllegalStateException e) {
            log.error("입장 처리 실패 (상태 오류): {}", e.getMessage());
            return ResponseEntity.status(409) // Conflict
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("입장 처리 중 예외 발생", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "입장 처리 중 오류가 발생했습니다."));
        }
    }

    /**
     * 퇴장 처리 (OUT)
     *
     * @param email 인증된 사용자 email
     * @param request 퇴장 요청 (지점 번호)
     * @return 퇴장 응답
     */
    @PostMapping("/exit")
    public ResponseEntity<?> processExit(
            @AuthenticationPrincipal(expression = "username") String email,
            @RequestBody AccessRequest request
    ) {
        log.info("퇴장 요청 - email: {}, gId: {}", email, request.getGId());

        // 1. 인증 확인
        if (email == null || email.isBlank()) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "인증 정보가 없습니다."));
        }
        if (request.getGId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "gId가 필요합니다."));
        }
        // 2. 사용자 조회
        UserDTO userDTO = userService.getUserByEmail(email.trim());
        if (userDTO == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "사용자를 찾을 수 없습니다."));
        }

        try {
            // 3. 퇴장 처리
            AccessResponse response = accessService.processExit(userDTO.getUId(), request);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("퇴장 처리 실패 (입력 오류): {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (IllegalStateException e) {
            log.error("퇴장 처리 실패 (상태 오류): {}", e.getMessage());
            return ResponseEntity.status(409) // Conflict
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("퇴장 처리 중 예외 발생", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "퇴장 처리 중 오류가 발생했습니다."));
        }
    }
}
