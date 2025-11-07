package com.my.back.controller;

import com.my.back.dto.BranchDetailResponse;
import com.my.back.dto.BranchStationResponse;
import com.my.back.dto.BranchTrainerResponse;
import com.my.back.dto.gym.GymInfoDtos;
import com.my.back.dto.gym.GymReviewDtos;
import com.my.back.entity.GymInfo;
import com.my.back.entity.GymReview;
import com.my.back.repository.GymReviewRepository;
import com.my.back.service.BranchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Optional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * ==============================================================
 * 🔹 BranchController - 지점 정보 API
 * ==============================================================
 * ✅ 엔드포인트 (공개)
 *  GET  /api/branches               - 전체 지점 목록 조회 (주변 역 정보 포함)
 *  GET  /api/branches/:id           - 특정 지점 상세 조회
 *  GET  /api/branches/:id/trainers  - 특정 지점 트레이너 목록 조회
 *
 * ✅ 엔드포인트 (관리자 전용)
 *  POST /api/admin/branches         - 지점 생성
 *  PUT  /api/admin/branches/:id     - 지점 수정
 *  DEL  /api/admin/branches/:id     - 지점 삭제
 *
 * 📌 인증
 *  - 공개 API: 인증 불필요
 *  - 관리자 API: ADMIN 권한 필요
 * ==============================================================
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class BranchController {

    private final BranchService branchService;
    private final GymReviewRepository gymReviewRepository;

    /** * 전체 지점 목록 조회 * * @return 지점 목록 */ @GetMapping("/branches") public ResponseEntity<List<BranchDetailResponse>> getAllBranches(@AuthenticationPrincipal UserDetails userDetails) { log.info("전체 지점 목록 조회 요청"); try { List<BranchDetailResponse> branches = branchService.getAllBranches(userDetails); return ResponseEntity.ok(branches); } catch (Exception e) { log.error("지점 목록 조회 중 예외 발생", e); return ResponseEntity.internalServerError().build(); } }

    /**
     * 특정 지점 상세 조회 (공개)
     *
     * @param id 지점 번호
     * @return 지점 상세 정보
     */
    @GetMapping("/branches/{id}")
    public ResponseEntity<?> getBranchDetailPublic(@PathVariable Long id) {
        log.info("지점 상세 조회 요청 (공개) - gId: {}", id);

        try {
            BranchDetailResponse branch = branchService.getBranchDetailPublic(id);
            return ResponseEntity.ok(branch);

        } catch (IllegalArgumentException e) {
            log.error("지점 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("지점 상세 조회 중 예외 발생", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "지점 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 특정 지점 상세 조회 (인증 사용자용)
     *
     * @param id 지점 번호
     * @param userDetails 사용자 정보
     * @return 지점 상세 정보
     */
    @GetMapping("/branches/{id}/detail")
    public ResponseEntity<?> getBranchDetail(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        log.info("지점 상세 조회 요청 - gId: {}", id);

        try {
            BranchDetailResponse branch = branchService.getBranchDetail(id, userDetails);
            return ResponseEntity.ok(branch);

        } catch (IllegalArgumentException e) {
            log.error("지점 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("지점 상세 조회 중 예외 발생", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "지점 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 특정 지점의 트레이너 목록 조회
     *
     * @param id 지점 번호
     * @return 트레이너 목록
     */
    @GetMapping("/branches/{id}/trainers")
    public ResponseEntity<?> getBranchTrainers(@PathVariable Long id) {
        log.info("지점 트레이너 목록 조회 요청 - gId: {}", id);

        try {
            List<BranchTrainerResponse> trainers = branchService.getBranchTrainers(id);
            return ResponseEntity.ok(trainers);

        } catch (IllegalArgumentException e) {
            log.error("트레이너 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("트레이너 목록 조회 중 예외 발생", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "트레이너 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 특정 지점의 리뷰 목록 조회
     *
     * @param id 지점 번호
     * @return 리뷰 목록
     */
    @GetMapping("/branches/{id}/reviews")
    public ResponseEntity<?> getBranchReviews(@PathVariable Long id) {
        log.info("지점 리뷰 목록 조회 요청 - gId: {}", id);

        try {
            GymReviewDtos.GymReviewListRes reviews = branchService.getBranchReviews(id);
            return ResponseEntity.ok(reviews);

        } catch (IllegalArgumentException e) {
            log.error("리뷰 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("리뷰 목록 조회 중 예외 발생", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "리뷰 조회 중 오류가 발생했습니다."));
        }
    }

    // =================================================================
    // 🔒 관리자 전용 API (ADMIN 권한 필요)
    // =================================================================

    /**
     * 지점 생성 (관리자 전용)
     *
     * @param req 지점 생성 요청
     * @param userDetails 인증된 사용자 정보
     * @return 생성된 지점 정보
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/branches")
    public ResponseEntity<?> createBranch(@RequestBody GymInfoDtos.CreateReq req,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        log.info("지점 생성 요청 - 관리자: {}", userDetails.getUsername());

        try {
            BranchDetailResponse created = branchService.createBranch(req);
            return ResponseEntity.ok(created);

        } catch (Exception e) {
            log.error("지점 생성 중 예외 발생", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "지점 생성 중 오류가 발생했습니다."));
        }
    }

    /**
     * 지점 수정 (관리자 전용)
     *
     * @param id 지점 번호
     * @param req 지점 수정 요청
     * @param userDetails 인증된 사용자 정보
     * @return 수정된 지점 정보
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/branches/{id}")
    public ResponseEntity<?> updateBranch(@PathVariable Long id,
                                         @RequestBody GymInfoDtos.UpdateReq req,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        log.info("지점 수정 요청 - gId: {}, 관리자: {}", id, userDetails.getUsername());

        try {
            BranchDetailResponse updated = branchService.updateBranch(id, req);
            return ResponseEntity.ok(updated);

        } catch (IllegalArgumentException e) {
            log.error("지점 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("지점 수정 중 예외 발생", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "지점 수정 중 오류가 발생했습니다."));
        }
    }

    /**
     * 지점 삭제 (관리자 전용)
     *
     * @param id 지점 번호
     * @param userDetails 인증된 사용자 정보
     * @return 삭제 결과
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/branches/{id}")
    public ResponseEntity<?> deleteBranch(@PathVariable Long id,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        log.info("지점 삭제 요청 - gId: {}, 관리자: {}", id, userDetails.getUsername());

        try {
            branchService.deleteBranch(id);
            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException e) {
            log.error("지점 삭제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("지점 삭제 중 예외 발생", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "지점 삭제 중 오류가 발생했습니다."));
        }
    }
}
