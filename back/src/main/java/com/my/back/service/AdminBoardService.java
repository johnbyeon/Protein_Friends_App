package com.my.back.service;

import com.my.back.dto.BoardCreateRequest;
import com.my.back.dto.BoardListResponse;
import com.my.back.dto.BoardResponse;
import com.my.back.dto.BoardUpdateRequest;
import com.my.back.entity.Board;
import com.my.back.entity.BoardType;
import com.my.back.entity.TrainerInfo;
import com.my.back.repository.BoardRepository;
import com.my.back.repository.BoardTypeRepository;
import com.my.back.repository.BoardViewerRepository;
import com.my.back.repository.TrainerInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin Board Service
 * - 관리자용 게시글 관리 (생성/수정/삭제)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminBoardService {

    private final BoardRepository boardRepository;
    private final BoardTypeRepository boardTypeRepository;
    private final TrainerInfoRepository trainerInfoRepository;
    private final BoardViewerRepository boardViewerRepository;

    /**
     * 게시글 타입별 목록 조회 (관리자용 - 숨김 게시글 포함)
     * @param pTypeId 게시글 타입 ID
     * @return 게시글 목록
     */
    public List<BoardListResponse> getAllBoardsByType(Long pTypeId) {
        log.info("📋 [ADMIN] 게시글 타입별 전체 목록 조회: pTypeId={}", pTypeId);

        List<Board> boards = boardRepository.findByPTypeIdOrderByPCreateDateDesc(pTypeId);

        // BoardType 조회
        BoardType boardType = boardTypeRepository.findById(pTypeId).orElse(null);
        String typeName = boardType != null ? boardType.getPTypeName() : "알 수 없음";

        return boards.stream()
                .map(board -> {
                    String trainerName = getTrainerName(board.getTId());
                    Long viewCount = boardViewerRepository.countByPId(board.getPId());
                    return BoardListResponse.from(board, typeName, trainerName, viewCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * 게시글 생성
     * @param request 게시글 생성 요청
     * @param trainerId 트레이너 ID
     * @return 생성된 게시글
     */
    @Transactional
    public BoardResponse createBoard(BoardCreateRequest request, Long trainerId) {
        log.info("➕ [ADMIN] 게시글 생성: typeId={}, title={}", request.getPTypeId(), request.getPTitle());

        // 필수 필드 검증
        if (request.getPTypeId() == null) {
            throw new IllegalArgumentException("게시글 타입을 선택해주세요.");
        }
        if (request.getPTitle() == null || request.getPTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("제목을 입력해주세요.");
        }
        if (request.getPContent() == null || request.getPContent().trim().isEmpty()) {
            throw new IllegalArgumentException("내용을 입력해주세요.");
        }

        // 게시글 타입 존재 확인
        if (!boardTypeRepository.existsById(request.getPTypeId())) {
            throw new IllegalArgumentException("존재하지 않는 게시글 타입입니다: " + request.getPTypeId());
        }

        // Board 엔티티 생성
        Board board = Board.builder()
                .pTypeId(request.getPTypeId())
                .tId(trainerId)
                .pTitle(request.getPTitle().trim())
                .pContent(request.getPContent().trim())
                .pImageUrl(request.getPImageUrl())
                .pLink(request.getPLink())
                .pIsPopup(request.getPIsPopup() != null ? request.getPIsPopup() : false)
                .isAlwaysPopup(request.getIsAlwaysPopup() != null ? request.getIsAlwaysPopup() : false)
                .pPopupStartDate(request.getPPopupStartDate())
                .pPopupEndDate(request.getPPopupEndDate())
                .isUnlimited(request.getIsUnlimited() != null ? request.getIsUnlimited() : false)
                .pSetVisible(request.getPSetVisible() != null ? request.getPSetVisible() : true)
                .pCreateDate(LocalDateTime.now())
                .pUpdateDate(LocalDateTime.now())
                .build();

        Board saved = boardRepository.save(board);
        log.info("✅ [ADMIN] 게시글 생성 완료: pId={}", saved.getPId());

        // 응답 생성
        String typeName = getBoardTypeName(saved.getPTypeId());
        String trainerName = getTrainerName(saved.getTId());
        return BoardResponse.fromFull(saved, typeName, trainerName, 0L);
    }

    /**
     * 게시글 수정
     * @param pId 게시글 ID
     * @param request 수정 요청
     * @return 수정된 게시글
     */
    @Transactional
    public BoardResponse updateBoard(Long pId, BoardUpdateRequest request) {
        log.info("✏️ [ADMIN] 게시글 수정: pId={}", pId);

        Board board = boardRepository.findById(pId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + pId));

        // 필드 업데이트
        if (request.getPTypeId() != null) {
            if (!boardTypeRepository.existsById(request.getPTypeId())) {
                throw new IllegalArgumentException("존재하지 않는 게시글 타입입니다: " + request.getPTypeId());
            }
            board.setPTypeId(request.getPTypeId());
        }
        if (request.getPTitle() != null) {
            board.setPTitle(request.getPTitle().trim());
        }
        if (request.getPContent() != null) {
            board.setPContent(request.getPContent().trim());
        }
        if (request.getPImageUrl() != null) {
            board.setPImageUrl(request.getPImageUrl());
        }
        if (request.getPLink() != null) {
            board.setPLink(request.getPLink());
        }
        if (request.getPIsPopup() != null) {
            board.setPIsPopup(request.getPIsPopup());
        }
        if (request.getIsAlwaysPopup() != null) {
            board.setIsAlwaysPopup(request.getIsAlwaysPopup());
        }
        if (request.getPPopupStartDate() != null) {
            board.setPPopupStartDate(request.getPPopupStartDate());
        }
        if (request.getPPopupEndDate() != null) {
            board.setPPopupEndDate(request.getPPopupEndDate());
        }
        if (request.getIsUnlimited() != null) {
            board.setIsUnlimited(request.getIsUnlimited());
        }
        if (request.getPSetVisible() != null) {
            board.setPSetVisible(request.getPSetVisible());
        }

        board.setPUpdateDate(LocalDateTime.now());

        log.info("✅ [ADMIN] 게시글 수정 완료: pId={}", pId);

        // 응답 생성
        String typeName = getBoardTypeName(board.getPTypeId());
        String trainerName = getTrainerName(board.getTId());
        Long viewCount = boardViewerRepository.countByPId(board.getPId());
        return BoardResponse.fromFull(board, typeName, trainerName, viewCount);
    }

    /**
     * 게시글 삭제
     * @param pId 게시글 ID
     */
    @Transactional
    public void deleteBoard(Long pId) {
        log.info("🗑️ [ADMIN] 게시글 삭제: pId={}", pId);

        if (!boardRepository.existsById(pId)) {
            throw new IllegalArgumentException("게시글을 찾을 수 없습니다: " + pId);
        }

        boardRepository.deleteById(pId);
        log.info("✅ [ADMIN] 게시글 삭제 완료: pId={}", pId);
    }

    /**
     * 트레이너 이름 조회 헬퍼 메서드
     */
    private String getTrainerName(Long tId) {
        if (tId == null) {
            return "관리자";
        }
        TrainerInfo trainer = trainerInfoRepository.findById(tId).orElse(null);
        return trainer != null ? trainer.getTName() : "알 수 없음";
    }

    /**
     * 게시글 타입 이름 조회 헬퍼 메서드
     */
    private String getBoardTypeName(Long pTypeId) {
        if (pTypeId == null) {
            return "알 수 없음";
        }
        BoardType boardType = boardTypeRepository.findById(pTypeId).orElse(null);
        return boardType != null ? boardType.getPTypeName() : "알 수 없음";
    }
}
