package com.my.back.controller;

import com.my.back.dto.review.ReviewDtos.CreateReq;
import com.my.back.dto.review.ReviewDtos.Res;
import com.my.back.dto.review.ReviewDtos.UpdateReq;
import com.my.back.service.TrainerReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 트레이너 리뷰 CRUD 엔드포인트.
 * <p>
 * 회원 인증이 이미 다른 필터/인터셉터에서 처리된다고 가정하고
 * DTO 변환과 검증은 서비스로 위임한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class TrainerReviewController {

    private final TrainerReviewService trainerReviewService;

    /**
     * 리뷰 생성.
     *
     * @param req 생성 요청 DTO
     * @return 생성된 리뷰 정보
     */
    @PostMapping("/reviews")
    public ResponseEntity<Res> create(@RequestBody CreateReq req) {
        // 요청 본문 검증 및 엔티티 저장은 서비스에서 담당한다.
        return ResponseEntity.ok(trainerReviewService.create(req));
    }

    /**
     * 특정 트레이너의 리뷰 목록 페이지 조회.
     *
     * @param trainerId 리뷰 대상 트레이너 식별자
     * @param page      페이지 번호(0-index)
     * @param size      페이지당 항목 수
     * @return 리뷰 응답 페이지
     */
    @GetMapping("/trainers/{trainerId}/reviews")
    public ResponseEntity<Page<Res>> listByTrainer(
            @PathVariable Long trainerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // 페이징 정보와 트레이너 검증을 서비스에 위임한다.
        return ResponseEntity.ok(trainerReviewService.listByTrainer(trainerId, page, size));
    }

    /**
     * 리뷰 수정.
     *
     * @param reviewId 리뷰 식별자
     * @param req      수정 요청 DTO
     * @return 수정된 리뷰 응답
     */
    @PatchMapping("/reviews/{reviewId}")
    public ResponseEntity<Res> update(@PathVariable Long reviewId, @RequestBody UpdateReq req) {
        // 부분 업데이트를 지원하기 위해 서비스에서 변경 가능한 필드만 적용한다.
        return ResponseEntity.ok(trainerReviewService.update(reviewId, req));
    }

    /**
     * 리뷰 삭제.
     *
     * @param reviewId 리뷰 식별자
     * @return 204 No Content
     */
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> delete(@PathVariable Long reviewId) {
        trainerReviewService.delete(reviewId);
        return ResponseEntity.noContent().build();
    }
}