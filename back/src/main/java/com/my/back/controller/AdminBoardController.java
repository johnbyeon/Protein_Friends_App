package com.my.back.controller;

import com.my.back.dto.BoardCreateRequest;
import com.my.back.dto.BoardListResponse;
import com.my.back.dto.BoardResponse;
import com.my.back.dto.BoardUpdateRequest;
import com.my.back.entity.Users;
import com.my.back.repository.UserRepository;
import com.my.back.service.AdminBoardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin Board Controller
 * - 게시글 생성/수정/삭제 API (관리자/트레이너 전용)
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/boards")
@RequiredArgsConstructor
public class AdminBoardController {

    private final AdminBoardService adminBoardService;
    private final UserRepository userRepository;

    /**
     * 게시글 타입별 목록 조회 (관리자용 - 모든 게시글 포함)
     * @param pTypeId 게시글 타입 ID
     * @return 게시글 목록
     */
    @GetMapping("/type/{pTypeId}")
    public ResponseEntity<?> getBoardsByTypeForAdmin(@PathVariable Long pTypeId) {
        log.info("📋 [ADMIN GET] /api/admin/boards/type/{} - 관리자용 게시글 목록 조회", pTypeId);
        try {
            List<BoardListResponse> boards = adminBoardService.getAllBoardsByType(pTypeId);
            return ResponseEntity.ok(boards);
        } catch (Exception e) {
            log.error("❌ 관리자 게시글 목록 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("게시글 목록을 불러오는데 실패했습니다."));
        }
    }

    /**
     * 게시글 생성
     * @param request 게시글 생성 요청
     * @param email 로그인한 사용자 이메일 (JWT에서 추출)
     * @return 생성된 게시글 정보
     */
    @PostMapping
    public ResponseEntity<?> createBoard(
            @RequestBody BoardCreateRequest request,
            @AuthenticationPrincipal String email
    ) {
        log.info("➕ [ADMIN POST] /api/admin/boards - 게시글 생성");

        try {
            // 이메일로 유저 조회 (트레이너 ID 필요)
            Users user = userRepository.findByEmail(email);
            if (user == null) {
                log.error("❌ 사용자를 찾을 수 없습니다: {}", email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("사용자를 찾을 수 없습니다."));
            }

            // 트레이너 ID 확인 (user_info에서 trainer_info의 t_id 가져오기)
            // TODO: UserInfo -> TrainerInfo 매핑 구현 필요
            // 임시로 user.getUId()를 tId로 사용 (실제로는 TrainerInfo에서 가져와야 함)
            Long trainerId = user.getUId(); // 임시 처리

            BoardResponse board = adminBoardService.createBoard(request, trainerId);
            return ResponseEntity.status(HttpStatus.CREATED).body(board);
        } catch (IllegalArgumentException e) {
            log.error("❌ 게시글 생성 실패 (잘못된 요청): {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("❌ 게시글 생성 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("게시글 생성에 실패했습니다."));
        }
    }

    /**
     * 게시글 수정
     * @param pId 게시글 ID
     * @param request 게시글 수정 요청
     * @return 수정된 게시글 정보
     */
    @PutMapping("/{pId}")
    public ResponseEntity<?> updateBoard(
            @PathVariable Long pId,
            @RequestBody BoardUpdateRequest request
    ) {
        log.info("✏️ [ADMIN PUT] /api/admin/boards/{} - 게시글 수정", pId);

        try {
            BoardResponse board = adminBoardService.updateBoard(pId, request);
            return ResponseEntity.ok(board);
        } catch (IllegalArgumentException e) {
            log.error("❌ 게시글 수정 실패 (잘못된 요청): {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("❌ 게시글 수정 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("게시글 수정에 실패했습니다."));
        }
    }

    /**
     * 게시글 삭제
     * @param pId 게시글 ID
     * @return 성공 메시지
     */
    @DeleteMapping("/{pId}")
    public ResponseEntity<?> deleteBoard(@PathVariable Long pId) {
        log.info("🗑️ [ADMIN DELETE] /api/admin/boards/{} - 게시글 삭제", pId);

        try {
            adminBoardService.deleteBoard(pId);
            return ResponseEntity.ok(new SuccessResponse("게시글이 삭제되었습니다."));
        } catch (IllegalArgumentException e) {
            log.error("❌ 게시글 삭제 실패 (잘못된 요청): {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("❌ 게시글 삭제 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("게시글 삭제에 실패했습니다."));
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
