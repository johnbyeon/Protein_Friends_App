package com.my.back.controller;

import com.my.back.dto.BoardTypeRequest;
import com.my.back.dto.BoardTypeReorderRequest;
import com.my.back.dto.BoardTypeResponse;
import com.my.back.service.BoardTypeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * BoardType Controller
 * - 게시글 타입 관리 API
 * - GET: 모든 사용자 허용
 * - POST/PUT/DELETE: ADMIN만 허용
 */
@Slf4j
@RestController
@RequestMapping("/api/board-types")
@RequiredArgsConstructor
public class BoardTypeController {

    private final BoardTypeService boardTypeService;

    /**
     * 모든 게시글 타입 조회
     * 접근 권한: 모든 사용자
     */
    @GetMapping
    public ResponseEntity<List<BoardTypeResponse>> getAllBoardTypes() {
        log.info("📋 [GET] /api/board-types - 모든 게시글 타입 조회");
        List<BoardTypeResponse> boardTypes = boardTypeService.getAllBoardTypes();
        return ResponseEntity.ok(boardTypes);
    }

    /**
     * ID로 게시글 타입 조회
     * 접근 권한: 모든 사용자
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBoardTypeById(@PathVariable Long id) {
        log.info("📋 [GET] /api/board-types/{} - 게시글 타입 조회", id);
        try {
            BoardTypeResponse boardType = boardTypeService.getBoardTypeById(id);
            return ResponseEntity.ok(boardType);
        } catch (IllegalArgumentException e) {
            log.error("❌ 게시글 타입 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * 게시글 타입 생성 (관리자 전용)
     * 접근 권한: ADMIN만
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createBoardType(@RequestBody BoardTypeRequest request) {
        log.info("➕ [POST] /api/board-types - 게시글 타입 생성: {}", request);
        try {
            BoardTypeResponse created = boardTypeService.createBoardType(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            log.error("❌ 게시글 타입 생성 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * 게시글 타입 수정 (관리자 전용)
     * 접근 권한: ADMIN만
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBoardType(
            @PathVariable Long id,
            @RequestBody BoardTypeRequest request) {
        log.info("✏️ [PUT] /api/board-types/{} - 게시글 타입 수정: {}", id, request);
        try {
            BoardTypeResponse updated = boardTypeService.updateBoardType(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            log.error("❌ 게시글 타입 수정 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * 게시글 타입 삭제 (관리자 전용)
     * 접근 권한: ADMIN만
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBoardType(@PathVariable Long id) {
        log.info("🗑️ [DELETE] /api/board-types/{} - 게시글 타입 삭제", id);
        try {
            boardTypeService.deleteBoardType(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("❌ 게시글 타입 삭제 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * 게시글 타입 순서 재배정 (관리자 전용)
     * - 드래그 앤 드롭으로 순서 변경 시 ID를 재배정
     * 접근 권한: ADMIN만
     */
    @PutMapping("/reorder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reorderBoardTypes(@RequestBody BoardTypeReorderRequest request) {
        log.info("🔄 [PUT] /api/board-types/reorder - 게시글 타입 순서 재배정");
        try {
            List<BoardTypeResponse> reordered = boardTypeService.reorderBoardTypes(request);
            return ResponseEntity.ok(reordered);
        } catch (IllegalArgumentException e) {
            log.error("❌ 게시글 타입 순서 재배정 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * 에러 응답 DTO
     */
    record ErrorResponse(String error) {}
}
