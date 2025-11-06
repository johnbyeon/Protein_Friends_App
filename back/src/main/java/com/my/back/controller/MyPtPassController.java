package com.my.back.controller;

import com.my.back.dto.PtPassCardDto;
import com.my.back.entity.Users;
import com.my.back.repository.UserRepository;
import com.my.back.service.MyPtPassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ===============================================================
 * ✅ MyPtPassController — 내 PT 이용권 조회 컨트롤러
 * ===============================================================
 * 🔹 주요 기능
 *   1) 전체 PT 이용권 조회  → GET /api/my/pt-passes
 *   2) 상태별 PT 이용권 조회 → GET /api/my/pt-passes?status=ACTIVE
 * ===============================================================
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/my")
public class MyPtPassController {

    /** 회원 정보 조회용 Repository */
    private final UserRepository userRepository;
    /** PT 이용권 비즈니스 로직 처리 Service */
    private final MyPtPassService myPtPassService;

    // ---------------------------------------------------------
    // ✅ 1. 전체 or 상태별 PT 이용권 조회
    // ---------------------------------------------------------
    /**
     * 🔹 인증된 사용자의 이메일을 기반으로 회원을 식별하고
     *    회원의 모든 PT 이용권 또는 특정 상태의 PT 이용권만 조회한다.
     *
     * 🔸 요청 예시:
     *    - 전체 조회:  GET /api/my/pt-passes
     *    - 상태별 조회: GET /api/my/pt-passes?status=ACTIVE
     *
     * 🔸 동작 순서:
     *   1) 인증 주체(@AuthenticationPrincipal)에서 이메일 추출
     *   2) 이메일로 Users 엔티티 조회
     *   3) 쿼리 파라미터 status 유무에 따라 서비스 분기 호출
     *      - 있으면 getPtPassesByStatus()
     *      - 없으면 getAllPtPasses()
     *   4) 변환된 DTO 리스트를 ResponseEntity로 반환
     */
    @GetMapping("/pt-passes")
    public ResponseEntity<?> allPtPasses(
            @AuthenticationPrincipal(expression = "username") String email,  // 🔸 현재 로그인한 사용자의 이메일
            @RequestParam(required = false) String status                     // 🔸 (옵션) 필터 상태값
    ) {
        // ✅ (1) 인증 검증
        if (email == null)
            return ResponseEntity.status(401).body("인증이 필요합니다.");

        // ✅ (2) 이메일로 사용자 조회
        Users me = userRepository.findByEmail(email);
        if (me == null)
            return ResponseEntity.status(404).body("유저를 찾을 수 없습니다.");

        // ✅ (3) 상태별 or 전체 조회 분기
        List<PtPassCardDto> ptPasses = (status != null)
                ? myPtPassService.getPtPassesByStatus(me.getUId(), status)
                : myPtPassService.getAllPtPasses(me.getUId());

        // ✅ (4) JSON 형태로 반환
        return ResponseEntity.ok(ptPasses);
    }
}