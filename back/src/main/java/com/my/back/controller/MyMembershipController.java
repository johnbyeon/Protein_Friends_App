package com.my.back.controller;

import com.my.back.dto.MembershipCardDto;
import com.my.back.entity.MembershipStatus;
import com.my.back.entity.Users;
import com.my.back.repository.UserRepository;
import com.my.back.service.MyMembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ===============================================================
 * ✅ MyMembershipController — 내 회원권 조회 컨트롤러
 * ===============================================================
 * 🔹 주요 기능
 *   1) 전체 회원권 조회  → GET /api/my/memberships
 *   2) 상태별 회원권 조회 → GET /api/my/memberships?status=ACTIVE
 * ===============================================================
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/my")
public class MyMembershipController {

    /** 회원 정보 조회용 Repository */
    private final UserRepository userRepository;
    /** 회원권 비즈니스 로직 처리 Service */
    private final MyMembershipService myMembershipService;

    // ---------------------------------------------------------
    // ✅ 1. 전체 or 상태별 회원권 조회
    // ---------------------------------------------------------
    /**
     * 🔹 인증된 사용자의 이메일을 기반으로 회원을 식별하고
     *    회원의 모든 회원권 또는 특정 상태의 회원권만 조회한다.
     *
     * 🔸 요청 예시:
     *    - 전체 조회:  GET /api/my/memberships
     *    - 상태별 조회: GET /api/my/memberships?status=ACTIVE
     *
     * 🔸 동작 순서:
     *   1) 인증 주체(@AuthenticationPrincipal)에서 이메일 추출
     *   2) 이메일로 Users 엔티티 조회
     *   3) 쿼리 파라미터 status 유무에 따라 서비스 분기 호출
     *      - 있으면 getMembershipsByStatus()
     *      - 없으면 getAllMemberships()
     *   4) 변환된 DTO 리스트를 ResponseEntity로 반환
     */
    @GetMapping("/memberships")
    public ResponseEntity<?> allMemberships(
            @AuthenticationPrincipal(expression = "username") String email,  // 🔸 현재 로그인한 사용자의 이메일
            @RequestParam(required = false) MembershipStatus status          // 🔸 (옵션) 필터 상태값
    ) {
        // ✅ (1) 인증 검증
        if (email == null)
            return ResponseEntity.status(401).body("인증이 필요합니다.");

        // ✅ (2) 이메일로 사용자 조회
        Users me = userRepository.findByEmail(email);
        if (me == null)
            return ResponseEntity.status(404).body("유저를 찾을 수 없습니다.");

        // ✅ (3) 상태별 or 전체 조회 분기
        List<MembershipCardDto> memberships = (status != null)
                ? myMembershipService.getMembershipsByStatus(me.getUId(), status)
                : myMembershipService.getAllMemberships(me.getUId());

        // ✅ (4) JSON 형태로 반환
        return ResponseEntity.ok(memberships);
    }
}
