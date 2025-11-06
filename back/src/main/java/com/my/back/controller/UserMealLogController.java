package com.my.back.controller;

import com.my.back.dto.meal.UserMealLogDtos;
import com.my.back.service.UserMealLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/meallog")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserMealLogController {

    private final UserMealLogService service;

    /** 식단 등록 */
    @PostMapping
    public ResponseEntity<Long> create(@RequestBody UserMealLogDtos.CreateReq req) {
        return ResponseEntity.ok(service.create(req));
    }

    /** 내 식단 전체 */
    @GetMapping("/{uId}")
    public ResponseEntity<?> findAll(@PathVariable Long uId) {
        return ResponseEntity.ok(service.findByUser(uId));
    }

    /** 상세조회 */
    @GetMapping("/detail/{recordId}")
    public ResponseEntity<?> detail(@PathVariable Long recordId) {
        return ResponseEntity.ok(service.findOne(recordId));
    }

    @PutMapping("/{recordId}")
    public ResponseEntity<Void> update(
            @PathVariable Long recordId,
            @RequestBody UserMealLogDtos.UpdateReq req
    ) {
        service.update(recordId, req);
        return ResponseEntity.noContent().build();
    }

    /** 삭제 */
    @DeleteMapping("/{recordId}")
    public ResponseEntity<?> delete(@PathVariable Long recordId) {
        service.delete(recordId);
        return ResponseEntity.noContent().build();
    }
}
