package com.my.back.controller;

import com.my.back.dto.InbodyGroupDto;
import com.my.back.entity.Users;
import com.my.back.repository.UserRepository;
import com.my.back.service.MyInbodyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 내 인바디 데이터 조회 API
 * GET /api/my/inbody  → 로그인 사용자의 인바디 데이터 목록(List<InbodyGroupDto>)
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/my")
public class MyInbodyController {

    private final MyInbodyService myInbodyService;
    private final UserRepository userRepository;

    @GetMapping("/inbody")
    public ResponseEntity<?> getMyInbody(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        if (email == null) {
            return ResponseEntity.status(401).body("인증이 필요합니다.");
        }

        Users user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).body("유저를 찾을 수 없습니다.");
        }

        List<InbodyGroupDto> inbodyData = myInbodyService.getMyInbody(user.getUId());
        return ResponseEntity.ok(inbodyData);
    }
}