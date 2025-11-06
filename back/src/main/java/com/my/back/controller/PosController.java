package com.my.back.controller;

import com.my.back.dto.PosPtPassRequestDto;
import com.my.back.dto.PosMembershipRequestDto;
import com.my.back.dto.PosResponseDto;
import com.my.back.service.PosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * ✅ PosController — 트레이너 현장 판매 컨트롤러
 * ===============================================================
 * 🔹 주요 기능
 *   1) PT 이용권 현장 판매  → POST /api/trainer/pos/pt-pass
 *   2) 회원권 현장 판매     → POST /api/trainer/pos/membership
 * ===============================================================
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/trainer/pos")
@PreAuthorize("hasRole('TRAINER')")
public class PosController {

    private final PosService posService;

    /**
     * 🔹 PT 이용권 현장 판매
     * - 트레이너가 회원에게 PT 이용권을 직접 판매
     */
    @PostMapping("/pt-pass")
    public ResponseEntity<PosResponseDto> sellPtPass(
            @Valid @RequestBody PosPtPassRequestDto request,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        log.info("🏋️ [TRAINER POS] PT 이용권 현장 판매 요청 - 이메일: {}, 회원ID: {}, PT권종: {}", 
                email, request.getUserId(), request.getPtName());

        PosResponseDto response = posService.sellPtPass(email, request);
        
        log.info("✅ [TRAINER POS] PT 이용권 판매 완료 - PT기록ID: {}, 결제금액: {}", 
                response.getRecordId(), response.getPrice());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 🔹 회원권 현장 판매
     * - 트레이너가 회원에게 회원권을 직접 판매
     */
    @PostMapping("/membership")
    public ResponseEntity<PosResponseDto> sellMembership(
            @Valid @RequestBody PosMembershipRequestDto request,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        log.info("🏋️ [TRAINER POS] 회원권 현장 판매 요청 - 이메일: {}, 회원ID: {}, 회원권ID: {}", 
                email, request.getUserId(), request.getMembershipId());

        PosResponseDto response = posService.sellMembership(email, request);
        
        log.info("✅ [TRAINER POS] 회원권 판매 완료 - 회원권로그ID: {}, 결제금액: {}", 
                response.getRecordId(), response.getPrice());
        
        return ResponseEntity.ok(response);
    }
}