package com.my.back.controller;

import com.my.back.dto.ChangePasswordRequest;
import com.my.back.dto.MyInfoResponse;
import com.my.back.dto.UpdateMyInfoRequest;
import com.my.back.service.MyInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
/**
 * 인포(내 정보) API
 * - /api/my           : 내 정보 조회 (GET)
 * - /api/my           : 내 정보 저장 (PATCH)
 * - /api/my/password  : 비밀번호 변경 (PATCH)
 *
 * SecurityConfig에서 JWT 인증이 성공하면
 *  @AuthenticationPrincipal(expression="username") 로 email 주입됨.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/my")
public class MyInfoController {

    private final MyInfoService myInfoService;

    /** 내 정보 조회 */
    @GetMapping
    public ResponseEntity<MyInfoResponse> me(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(myInfoService.getMyInfoByEmail(email));
    }

    /** 내 정보 저장(부분 업데이트) */
    @PatchMapping
    public ResponseEntity<MyInfoResponse> update(
            @AuthenticationPrincipal(expression = "username") String email,
            @RequestBody UpdateMyInfoRequest req
    ) {
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(myInfoService.updateMyInfo(email, req));
    }

    /** 비밀번호 변경 (로컬 계정 전용) */
    @PatchMapping("/password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @AuthenticationPrincipal(expression = "username") String email,
            @RequestBody ChangePasswordRequest req
    ) {
        if (email == null) {
            return ResponseEntity.status(401).body(Map.of("error", "인증 정보가 없습니다."));
        }

        myInfoService.changePassword(email, req);

        return ResponseEntity.ok(
                Map.of(
                        "message", "비밀번호가 성공적으로 변경되었습니다.",
                        "email", email
                )
        );
    }

}
