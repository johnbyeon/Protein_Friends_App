package com.my.back.controller;

import com.my.back.dto.meal.MealLogAdminDtos;
import com.my.back.dto.meal.MealTrainerCommentDto;
import com.my.back.service.MealLogAdminService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자용 식단 관리 Controller
 */
@RestController
@RequestMapping("/api/admin/meallog")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class MealLogAdminController {

    private final MealLogAdminService service;

    /** ✅ 식단 등록 */
    @PostMapping
    public ResponseEntity<Long> create(@RequestBody MealLogAdminDtos.CreateReq req) {
        return ResponseEntity.ok(service.create(req));
    }

    /** ✅ 전체 조회 */
    @GetMapping
    public ResponseEntity<List<MealLogAdminDtos.Res>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    /** ✅ 단건 조회 */
    @GetMapping("/{recordId}")
    public ResponseEntity<MealLogAdminDtos.Res> findOne(@PathVariable Long recordId) {
        return ResponseEntity.ok(service.findById(recordId));
    }

    /** ✅ 수정 */
    @PutMapping("/{recordId}")
    public ResponseEntity<Void> update(@PathVariable Long recordId,
                                       @RequestBody MealLogAdminDtos.UpdateReq req) {
        service.update(recordId, req);
        return ResponseEntity.noContent().build();
    }

    /** ✅ 삭제 */
    @DeleteMapping("/{recordId}")
    public ResponseEntity<Void> delete(@PathVariable Long recordId) {
        service.delete(recordId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/trainer/meal-log/{detailId}/comment")
    public ResponseEntity<String> updateTrainerComment(
            @PathVariable Long detailId,
            @RequestBody MealTrainerCommentDto dto
    ) {
        service.updateTrainerComment(detailId, dto.trainerComment());
        return ResponseEntity.ok("Trainer comment updated");
    }

}
