package com.my.back.controller;

import com.my.back.dto.AnswerRequest;
import com.my.back.dto.QuestionRequest;
import com.my.back.dto.QuestionResponse;
import com.my.back.dto.UserDTO;
import com.my.back.entity.TrainerInfo;
import com.my.back.repository.TrainerInfoRepository;
import com.my.back.dto.CustomUserDetails;
import com.my.back.service.QuestionService;
import com.my.back.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 1:1 문의 Controller
 * ADMIN, TRAINER 권한 필요
 */
@RestController
@RequestMapping("/api/support/inquiries")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;
    private final UserService userService;
    private final TrainerInfoRepository trainerInfoRepository;

    /**
     * 문의 목록 조회
     * GET /api/support/inquiries?status=unanswered&page=0&size=10
     */
    @GetMapping
    public ResponseEntity<?> getInquiries(
            @RequestParam(defaultValue = "unanswered") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            // 인증 확인
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<QuestionResponse> result = questionService.getQuestions(status, pageable);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("문의 목록 조회 실패: " + e.getMessage());
        }
    }

    /**
     * 문의 상세 조회
     * GET /api/support/inquiries/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getInquiry(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            // 인증 확인
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }

            QuestionResponse result = questionService.getQuestion(id);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("문의 조회 실패: " + e.getMessage());
        }
    }

    /**
     * 답변 등록
     * POST /api/support/inquiries/{id}/answer
     */
    @PostMapping("/{id}/answer")
    public ResponseEntity<?> createAnswer(
            @PathVariable Long id,
            @RequestBody AnswerRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            // 인증 확인
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }

            // 트레이너 ID 조회
            Long trainerId = getTrainerIdFromUserDetails(userDetails);
            if (trainerId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("트레이너 권한이 필요합니다.");
            }

            QuestionResponse result = questionService.createAnswer(id, trainerId, request);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("답변 등록 실패: " + e.getMessage());
        }
    }

    /**
     * 답변 수정
     * PUT /api/support/inquiries/{id}/answer
     */
    @PutMapping("/{id}/answer")
    public ResponseEntity<?> updateAnswer(
            @PathVariable Long id,
            @RequestBody AnswerRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            // 인증 확인
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }

            // 트레이너 ID 조회
            Long trainerId = getTrainerIdFromUserDetails(userDetails);
            if (trainerId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("트레이너 권한이 필요합니다.");
            }

            QuestionResponse result = questionService.updateAnswer(id, trainerId, request);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("답변 수정 실패: " + e.getMessage());
        }
    }

    /**
     * 미답변 문의 개수 조회
     * GET /api/support/inquiries/count/unanswered
     */
    @GetMapping("/count/unanswered")
    public ResponseEntity<?> getUnansweredCount(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }

            Pageable pageable = PageRequest.of(0, 1);
            Page<QuestionResponse> result = questionService.getQuestions("unanswered", pageable);
            
            return ResponseEntity.ok(result.getTotalElements());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("카운트 조회 실패: " + e.getMessage());
        }
    }

    /**
     * 답변완료 문의 개수 조회
     * GET /api/support/inquiries/count/answered
     */
    @GetMapping("/count/answered")
    public ResponseEntity<?> getAnsweredCount(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }

            Pageable pageable = PageRequest.of(0, 1);
            Page<QuestionResponse> result = questionService.getQuestions("answered", pageable);
            
            return ResponseEntity.ok(result.getTotalElements());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("카운트 조회 실패: " + e.getMessage());
        }
    }

    /**
     * 내 문의 목록 조회 (유저용)
     * GET /api/support/my-inquiries?page=0&size=10
     */
    @GetMapping("/my-inquiries")
    public ResponseEntity<?> getMyInquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            // 인증 확인
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }

            // 유저 ID 조회
            String email = userDetails.getUsername();
            UserDTO user = userService.getUserByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("사용자를 찾을 수 없습니다.");
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<QuestionResponse> result = questionService.getMyQuestions(user.getUId(), pageable);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("문의 목록 조회 실패: " + e.getMessage());
        }
    }

    /**
     * 문의 등록 (유저용)
     * POST /api/support/my-inquiries
     */
    @PostMapping("/my-inquiries")
    public ResponseEntity<?> createInquiry(
            @RequestBody @Valid QuestionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            // 인증 확인
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }

            // 유저 ID 조회
            String email = userDetails.getUsername();
            UserDTO user = userService.getUserByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("사용자를 찾을 수 없습니다.");
            }

            QuestionResponse result = questionService.createQuestion(user.getUId(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("문의 등록 실패: " + e.getMessage());
        }
    }

    /**
     * 로그인한 유저의 트레이너 ID 조회
     */
    private Long getTrainerIdFromUserDetails(CustomUserDetails userDetails) {
        try {
            String email = userDetails.getUsername();
            UserDTO user = userService.getUserByEmail(email);
            
            if (user == null) {
                return null;
            }

            // 트레이너 정보 조회
            TrainerInfo trainerInfo = trainerInfoRepository.findByuId(user.getUId())
                    .orElse(null);
            
            return trainerInfo != null ? trainerInfo.getTId() : null;
        } catch (Exception e) {
            return null;
        }
    }
}

