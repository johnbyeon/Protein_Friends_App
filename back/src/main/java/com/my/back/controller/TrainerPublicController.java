package com.my.back.controller;

import com.my.back.dto.trainer.TrainerPublicDtos.DetailRes;
import com.my.back.dto.trainer.TrainerPublicDtos.SummaryRes;
import com.my.back.service.TrainerPublicService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * 회원 전용 트레이너 조회 API 엔드포인트.
 * <p>
 * 서비스 레이어에서 이미 정리해 둔 DTO를 그대로 반환하여
 * 컨트롤러는 HTTP 처리에만 집중하도록 단순화한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/trainers")
public class TrainerPublicController {

    private final TrainerPublicService trainerPublicService;

    /**
     * 트레이너 목록 조회.
     *
     * @param gymId   선택적으로 특정 지점(Gym)에 속한 트레이너만 필터링
     * @param keyword 트레이너 이름 키워드 검색. null/빈값이면 전체 검색
     * @param page    페이지 번호(0-index)
     * @param size    페이지당 항목 수
     * @return 트레이너 목록 요약 페이지
     */
    @GetMapping
    public ResponseEntity<Page<SummaryRes>> list(
            @RequestParam(required = false) Long gymId,
            @RequestParam(required = false, name = "q") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // 서비스 호출만 위임. 필터링/정렬은 서비스에서 처리한다.
        return ResponseEntity.ok(trainerPublicService.list(gymId, keyword, page, size));
    }

    /**
     * 트레이너 단건 상세 조회.
     *
     * @param trainerId 식별자
     * @return 상세 정보 DTO
     */
    @GetMapping("/{trainerId}")
    public ResponseEntity<DetailRes> get(@PathVariable Long trainerId) {
        // 존재 여부, 재직 여부 검증은 서비스에 위임한다.
        return ResponseEntity.ok(trainerPublicService.get(trainerId));
    }
}