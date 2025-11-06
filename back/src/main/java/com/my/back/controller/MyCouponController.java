package com.my.back.controller;

import com.my.back.dto.CouponCardDto;
import com.my.back.entity.Users;
import com.my.back.repository.UserRepository;
import com.my.back.service.MyCouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 내 할인권 조회 API
 * GET /api/my/coupons  → 로그인 사용자의 할인권 목록(List<CouponCardDto>)
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/my")
public class MyCouponController {

    private final MyCouponService myCouponService;
    private final UserRepository userRepository;

    @GetMapping("/coupons")
    public ResponseEntity<?> getMyCoupons(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        if (email == null) {
            return ResponseEntity.status(401).body("인증이 필요합니다.");
        }

        Users user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).body("유저를 찾을 수 없습니다.");
        }

        List<CouponCardDto> coupons = myCouponService.getMyCoupons(user.getUId());
        return ResponseEntity.ok(coupons);
    }
}
