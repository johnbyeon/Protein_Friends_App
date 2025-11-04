package com.my.back.controller;

import com.my.back.dto.BoardListResponse;
import com.my.back.dto.BoardResponse;
import com.my.back.entity.Users;
import com.my.back.repository.UserRepository;
import com.my.back.service.BoardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Board Controller
 * - 게시글 조회 API (유저용)
 * - GET: 모든 사용자 허용
 * - POST/PUT/DELETE: 관리자/트레이너 전용 (추후 구현)
 */
@Slf4j
@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;
    private final UserRepository userRepository;

    /**
     * 게시글 타입별 목록 조회
     * 접근 권한: 모든 사용자
     * @param pTypeId 게시글 타입 ID
     * @return 게시글 목록
     */
    @GetMapping("/type/{pTypeId}")
    public ResponseEntity<?> getBoardsByType(@PathVariable Long pTypeId) {
        log.info("📋 [GET] /api/boards/type/{} - 게시글 타입별 목록 조회", pTypeId);
        try {
            List<BoardListResponse> boards = boardService.getBoardsByType(pTypeId);
            return ResponseEntity.ok(boards);
        } catch (Exception e) {
            log.error("❌ 게시글 목록 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("게시글 목록을 불러오는데 실패했습니다."));
        }
    }

    /**
     * 게시글 상세 조회
     * 접근 권한: 모든 사용자
     * @param pId 게시글 ID
     * @return 게시글 상세 정보
     */
    @GetMapping("/{pId}")
    public ResponseEntity<?> getBoardDetail(@PathVariable Long pId) {
        log.info("📄 [GET] /api/boards/{} - 게시글 상세 조회", pId);
        try {
            BoardResponse board = boardService.getBoardDetail(pId);
            return ResponseEntity.ok(board);
        } catch (IllegalArgumentException e) {
            log.error("❌ 게시글 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("❌ 게시글 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("게시글을 불러오는데 실패했습니다."));
        }
    }

    /**
     * 전체 게시글 조회 (관리자용)
     * 접근 권한: 모든 사용자 (추후 관리자 권한 추가 가능)
     * @return 전체 게시글 목록
     */
    @GetMapping
    public ResponseEntity<?> getAllBoards() {
        log.info("📋 [GET] /api/boards - 전체 게시글 조회");
        try {
            List<BoardListResponse> boards = boardService.getAllBoards();
            return ResponseEntity.ok(boards);
        } catch (Exception e) {
            log.error("❌ 전체 게시글 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("게시글 목록을 불러오는데 실패했습니다."));
        }
    }

    /**
     * 활성 팝업 게시글 조회
     * 접근 권한: 모든 사용자
     * @return 팝업 게시글 목록
     */
    @GetMapping("/popups")
    public ResponseEntity<?> getActivePopups() {
        log.info("🔔 [GET] /api/boards/popups - 활성 팝업 게시글 조회");
        try {
            List<BoardResponse> popups = boardService.getActivePopups();
            return ResponseEntity.ok(popups);
        } catch (Exception e) {
            log.error("❌ 팝업 게시글 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("팝업 게시글을 불러오는데 실패했습니다."));
        }
    }

    /**
     * 게시글 조회수 기록
     * 접근 권한: 로그인한 사용자
     * @param pId 게시글 ID
     * @param email 로그인한 사용자 이메일 (JWT에서 추출)
     * @return 성공 메시지
     */
    @PostMapping("/{pId}/view")
    public ResponseEntity<?> recordView(
            @PathVariable Long pId,
            @AuthenticationPrincipal String email
    ) {
        log.info("👁️ [POST] /api/boards/{}/view - 조회수 기록", pId);

        try {
            // 이메일로 유저 ID 조회
            Users user = userRepository.findByEmail(email);
            if (user == null) {
                log.error("❌ 사용자를 찾을 수 없습니다: {}", email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("사용자를 찾을 수 없습니다."));
            }

            // 조회수 기록
            boardService.recordView(pId, user.getUId());

            return ResponseEntity.ok(new SuccessResponse("조회수가 기록되었습니다."));
        } catch (Exception e) {
            log.error("❌ 조회수 기록 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("조회수 기록에 실패했습니다."));
        }
    }

    /**
     * 에러 응답 DTO
     */
    record ErrorResponse(String error) {}

    /**
     * 성공 응답 DTO
     */
    record SuccessResponse(String message) {}
}
