package com.my.back.controller;

import com.my.back.dto.CustomUserDetails;
import com.my.back.dto.FaqRequest;
import com.my.back.dto.FaqResponse;
import com.my.back.service.FaqService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * FAQ Controller
 * - 유저: 조회만 가능
 * - 관리자: CRUD 모두 가능
 */
@RestController
@RequestMapping("/api/faqs")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    /**
     * FAQ 목록 조회 (공통)
     * GET /api/faqs?category=카테고리&keyword=검색어&page=0&size=10
     */
    @GetMapping
    public ResponseEntity<?> getFaqs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<FaqResponse> result = faqService.getFaqs(category, keyword, pageable);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("FAQ 목록 조회 실패: " + e.getMessage());
        }
    }

    /**
     * FAQ 상세 조회 (공통)
     * GET /api/faqs/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getFaq(@PathVariable Long id) {
        try {
            FaqResponse result = faqService.getFaq(id);
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("FAQ 조회 실패: " + e.getMessage());
        }
    }

    /**
     * 카테고리 목록 조회 (공통)
     * GET /api/faqs/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        try {
            List<String> categories = faqService.getCategories();
            return ResponseEntity.ok(categories);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("카테고리 목록 조회 실패: " + e.getMessage());
        }
    }

    /**
     * FAQ 등록 (관리자, 트레이너)
     * POST /api/faqs
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<?> createFaq(
            @RequestBody @Valid FaqRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            FaqResponse result = faqService.createFaq(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("FAQ 등록 실패: " + e.getMessage());
        }
    }

    /**
     * FAQ 수정 (관리자, 트레이너)
     * PUT /api/faqs/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<?> updateFaq(
            @PathVariable Long id,
            @RequestBody @Valid FaqRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            FaqResponse result = faqService.updateFaq(id, request);
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("FAQ 수정 실패: " + e.getMessage());
        }
    }

    /**
     * FAQ 삭제 (관리자, 트레이너)
     * DELETE /api/faqs/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<?> deleteFaq(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            faqService.deleteFaq(id);
            return ResponseEntity.ok("FAQ가 삭제되었습니다.");
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("FAQ 삭제 실패: " + e.getMessage());
        }
    }
}

