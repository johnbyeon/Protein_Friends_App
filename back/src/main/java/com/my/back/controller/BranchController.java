package com.my.back.controller;

import com.my.back.dto.BranchDetailResponse;
import com.my.back.dto.BranchTrainerResponse;
import com.my.back.service.BranchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ==============================================================
 * 🔹 BranchController - 지점 정보 API
 * ==============================================================
 * ✅ 엔드포인트
 *  GET  /api/branches               - 전체 지점 목록 조회 (주변 역 정보 포함)
 *  GET  /api/branches/:id           - 특정 지점 상세 조회
 *  GET  /api/branches/:id/trainers  - 특정 지점 트레이너 목록 조회
 *
 * 📌 인증
 *  - 인증 불필요 (공개 정보)
 * ==============================================================
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/branches")
public class BranchController {

    private final BranchService branchService;

    /**
     * 전체 지점 목록 조회
     *
     * @return 지점 목록 (주변 역 정보 포함)
     */
    @GetMapping
    public ResponseEntity<List<BranchDetailResponse>> getAllBranches() {
        log.info("전체 지점 목록 조회 요청");

        try {
            List<BranchDetailResponse> branches = branchService.getAllBranches();
            return ResponseEntity.ok(branches);

        } catch (Exception e) {
            log.error("지점 목록 조회 중 예외 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 지점 상세 조회
     *
     * @param id 지점 번호
     * @return 지점 상세 정보
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBranchDetail(@PathVariable Long id) {
        log.info("지점 상세 조회 요청 - gId: {}", id);

        try {
            BranchDetailResponse branch = branchService.getBranchDetail(id);
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
    @GetMapping("/{id}/trainers")
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
}
