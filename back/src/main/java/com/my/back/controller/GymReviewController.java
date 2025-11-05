package com.my.back.controller;

import com.my.back.dto.common.PageResponse;
import com.my.back.dto.gym.GymReviewDtos;
import com.my.back.service.GymReviewService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gyms")
@RequiredArgsConstructor
public class GymReviewController {

    private final GymReviewService gymReviewService;

    /** 지점 리뷰 목록 조회 */
    @GetMapping("/{gId}/reviews")
    public ResponseEntity<PageResponse<GymReviewDtos.GymReviewItem>> getGymReviews(
            @PathVariable Long gId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // gId 기준 페이징된 리뷰 리스트
        return ResponseEntity.ok(gymReviewService.getGymReviews(gId, page, size));
    }

    /** 특정 회원이 남긴 지점 리뷰 단건 조회 */
    @GetMapping("/{gId}/reviews/{uId}")
    public ResponseEntity<GymReviewDtos.GymReviewItem> getGymReview(
            @PathVariable Long gId, @PathVariable Long uId
    ) {
        // gId + uId = 복합키로 단건 조회
        return ResponseEntity.ok(gymReviewService.getGymReview(gId, uId));
    }

    /** 지점 리뷰 작성 (로그인 유저) */
    @PostMapping("/{gId}/reviews")
    public ResponseEntity<Void> createGymReview(
            @PathVariable Long gId,
            @RequestBody @Valid GymReviewDtos.CreateGymReviewReq req
    ) {
        // 리뷰 1회 제한 + 이용 이력 체크
        gymReviewService.createGymReview(gId, req);
        return ResponseEntity.ok().build();
    }

    /** 지점 리뷰 수정 (로그인 유저 본인 리뷰만) */
    @PutMapping("/{gId}/reviews")
    public ResponseEntity<Void> updateGymReview(
            @PathVariable Long gId,
            @RequestBody @Valid GymReviewDtos.CreateGymReviewReq req
    ) {
        // 본인 리뷰만 수정 가능
        gymReviewService.updateGymReview(gId, req);
        return ResponseEntity.ok().build();
    }

    /** 지점 리뷰 삭제 (로그인 유저 본인 리뷰만) */
    @DeleteMapping("/{gId}/reviews")
    public ResponseEntity<Void> deleteGymReview(@PathVariable Long gId) {
        // 본인 리뷰만 삭제 가능
        gymReviewService.deleteGymReview(gId);
        return ResponseEntity.ok().build();
    }
}
