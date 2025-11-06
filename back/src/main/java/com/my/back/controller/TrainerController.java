package com.my.back.controller;

import com.my.back.dto.trainer.TrainerDtos.CreateReq;
import com.my.back.dto.trainer.TrainerDtos.UpdateReq;
import com.my.back.dto.trainer.TrainerDtos.Res;
import com.my.back.service.TrainerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * TrainerController
 * - 관리자용 트레이너 관리 API
 * - 기능: 등록, 조회, 수정, 삭제, 고용상태 변경
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/trainers")
@CrossOrigin(origins = "http://localhost:5173")
public class TrainerController {

    private final TrainerService trainerService;

    /** 트레이너 등록 */
    @PostMapping
    public ResponseEntity<Res> create(@RequestBody CreateReq req) {
        return ResponseEntity.ok(trainerService.create(req));
    }

    /** 트레이너 목록 조회 (검색 + 필터 + 페이지네이션) */
    @GetMapping
    public ResponseEntity<Page<Res>> list(
            @RequestParam(required = false) Long gymId,
            @RequestParam(required = false) Boolean employed,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort
    ) {
        return ResponseEntity.ok(trainerService.list(gymId, employed, q, page, size, sort));
    }

    /** 트레이너 단건 조회 */
    @GetMapping("/{tId}")
    public ResponseEntity<Res> get(@PathVariable Long tId) {
        return ResponseEntity.ok(trainerService.get(tId));
    }

    /** 트레이너 정보 수정 */
    @PutMapping("/{tId}")
    public ResponseEntity<Res> update(@PathVariable Long tId, @RequestBody UpdateReq req) {
        return ResponseEntity.ok(trainerService.update(tId, req));
    }

    /** 고용상태 변경 (재직/퇴직 토글) */
    @PatchMapping("/{tId}/employment")
    public ResponseEntity<Res> toggleEmployment(@PathVariable Long tId, @RequestParam boolean employed) {
        return ResponseEntity.ok(trainerService.toggleEmployment(tId, employed));
    }

    /** 트레이너 삭제 */
    @DeleteMapping("/{tId}")
    public ResponseEntity<Void> delete(@PathVariable Long tId) {
        trainerService.delete(tId);
        return ResponseEntity.noContent().build();
    }
}
