// src/main/java/com/my/back/controller/MembershipController.java
package com.my.back.controller;

import com.my.back.dto.market.MembershipCheckoutDto;
import com.my.back.dto.market.MembershipDto;
import com.my.back.dto.market.PayResultDto;
import com.my.back.service.MembershipPurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/memberships")
public class MembershipController {

    private final MembershipPurchaseService membershipPurchaseService;

    /** ✅ 회원권 리스트 (활성/판매중) */
    @GetMapping
    public ResponseEntity<List<MembershipDto>> list() {
        return ResponseEntity.ok(membershipPurchaseService.listActive());
    }

    /** ✅ 회원권 주문서 (쿠폰/합계 포함) */
    @GetMapping("/{id}/checkout")
    public ResponseEntity<MembershipCheckoutDto> checkout(
            @PathVariable Long id,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return ResponseEntity.ok(membershipPurchaseService.checkout(email, id));
    }

    /** ✅ 회원권 결제 (선택 쿠폰 적용 가능) */
    @PostMapping("/{id}/pay")
    public ResponseEntity<PayResultDto> pay(
            @PathVariable Long id,
            @AuthenticationPrincipal(expression = "username") String email,
            @RequestParam(required = false) Long recDisId // 보유쿠폰 ID(선택)
    ) {
        return ResponseEntity.ok(membershipPurchaseService.pay(email, id, recDisId));
    }

    /** ✅ 완료 페이지 요약 */
    @GetMapping("/complete/{orderId}")
    public ResponseEntity<PayResultDto> complete(@PathVariable String orderId) {
        return ResponseEntity.ok(membershipPurchaseService.complete(orderId));
    }
}
