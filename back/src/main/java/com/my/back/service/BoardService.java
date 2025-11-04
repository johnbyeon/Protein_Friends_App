package com.my.back.service;

import com.my.back.dto.BoardListResponse;
import com.my.back.dto.BoardResponse;
import com.my.back.entity.Board;
import com.my.back.entity.BoardType;
import com.my.back.entity.BoardViewer;
import com.my.back.entity.TrainerInfo;
import com.my.back.repository.BoardRepository;
import com.my.back.repository.BoardTypeRepository;
import com.my.back.repository.BoardViewerRepository;
import com.my.back.repository.TrainerInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Board Service
 * - 게시글 조회 및 관리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;
    private final BoardTypeRepository boardTypeRepository;
    private final TrainerInfoRepository trainerInfoRepository;
    private final BoardViewerRepository boardViewerRepository;

    /**
     * 게시글 타입별 목록 조회 (유저용 - 노출되는 게시글만)
     * @param pTypeId 게시글 타입 ID
     * @return 게시글 목록
     */
    public List<BoardListResponse> getBoardsByType(Long pTypeId) {
        log.info("📋 게시글 타입별 목록 조회: pTypeId={}", pTypeId);

        List<Board> boards = boardRepository.findByPTypeIdAndVisible(pTypeId);

        // BoardType 조회 (타입 이름 가져오기)
        BoardType boardType = boardTypeRepository.findById(pTypeId)
                .orElse(null);
        String typeName = boardType != null ? boardType.getPTypeName() : "알 수 없음";

        return boards.stream()
                .map(board -> {
                    // 트레이너 이름 조회
                    String trainerName = getTrainerName(board.getTId());
                    // 조회수 조회
                    Long viewCount = boardViewerRepository.countByPId(board.getPId());
                    return BoardListResponse.from(board, typeName, trainerName, viewCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * 게시글 상세 조회 (유저용)
     * @param pId 게시글 ID
     * @return 게시글 상세 정보
     */
    public BoardResponse getBoardDetail(Long pId) {
        log.info("📄 게시글 상세 조회: pId={}", pId);

        Board board = boardRepository.findByIdAndVisible(pId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + pId));

        // 타입 이름 조회
        String typeName = getBoardTypeName(board.getPTypeId());

        // 트레이너 이름 조회
        String trainerName = getTrainerName(board.getTId());

        // 조회수 조회
        Long viewCount = boardViewerRepository.countByPId(board.getPId());

        return BoardResponse.fromFull(board, typeName, trainerName, viewCount);
    }

    /**
     * 전체 게시글 조회 (관리자용)
     * @return 전체 게시글 목록
     */
    public List<BoardListResponse> getAllBoards() {
        log.info("📋 전체 게시글 조회 (관리자용)");

        List<Board> boards = boardRepository.findAllVisible();

        return boards.stream()
                .map(board -> {
                    String typeName = getBoardTypeName(board.getPTypeId());
                    String trainerName = getTrainerName(board.getTId());
                    Long viewCount = boardViewerRepository.countByPId(board.getPId());
                    return BoardListResponse.from(board, typeName, trainerName, viewCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * 활성 팝업 게시글 조회
     * @return 팝업 게시글 목록
     */
    public List<BoardResponse> getActivePopups() {
        log.info("🔔 활성 팝업 게시글 조회");

        List<Board> popups = boardRepository.findActivePopups();

        return popups.stream()
                .map(board -> {
                    String typeName = getBoardTypeName(board.getPTypeId());
                    String trainerName = getTrainerName(board.getTId());
                    Long viewCount = boardViewerRepository.countByPId(board.getPId());
                    return BoardResponse.fromFull(board, typeName, trainerName, viewCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * 게시글 조회수 기록
     * - 하루에 한 번만 기록됨 (같은 유저가 같은 게시글을 여러 번 봐도 1회)
     * @param pId 게시글 ID
     * @param uId 유저 ID
     */
    @Transactional
    public void recordView(Long pId, Long uId) {
        log.info("👁️ 조회수 기록: pId={}, uId={}", pId, uId);

        // 오늘 날짜 범위 계산
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN); // 00:00:00
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);   // 23:59:59

        // 이미 오늘 조회했는지 확인
        boolean alreadyViewed = boardViewerRepository.existsByPIdAndUIdToday(
                pId, uId, startOfDay, endOfDay
        );

        if (alreadyViewed) {
            log.info("  ⏭️ 이미 오늘 조회한 게시글: pId={}, uId={}", pId, uId);
            return;
        }

        // 새로운 조회 기록 생성
        BoardViewer viewer = BoardViewer.builder()
                .pId(pId)
                .uId(uId)
                .date(LocalDateTime.now())
                .build();

        boardViewerRepository.save(viewer);
        log.info("  ✅ 조회수 기록 완료: pId={}, uId={}", pId, uId);
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
