package com.my.back.controller;

import com.my.back.dto.recommend.RecommendMealDtos;
import com.my.back.service.RecommendMealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trainer/recommend-meal")
@RequiredArgsConstructor
public class RecommendMealController {

    private final RecommendMealService service;

    /** 생성 */
    @PostMapping
    public ResponseEntity<Long> create(@RequestBody RecommendMealDtos.CreateReq req) {
        return ResponseEntity.ok(service.create(req));
    }

    /** 특정 회원 추천 식단 목록 조회 */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getByUser(userId));
    }

    /** 상세 조회 */
    @GetMapping("/{recId}")
    public ResponseEntity<?> getDetail(@PathVariable Long recId) {
        return ResponseEntity.ok(service.getDetail(recId));
    }

    /** 삭제 */
    @DeleteMapping("/{recId}")
    public ResponseEntity<?> delete(@PathVariable Long recId) {
        service.delete(recId);
        return ResponseEntity.ok("deleted");
    }
}
