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
import com.my.back.util.S3Util;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
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
    private final S3PresignService s3PresignService;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    /**
     * 게시글 타입별 목록 조회 (유저용 - 노출되는 게시글만)
     * @param pTypeId 게시글 타입 ID
     * @return 게시글 목록
     */
    public List<BoardListResponse> getBoardsByType(Long pTypeId) {
        log.info("📋 게시글 타입별 목록 조회: pTypeId={}", pTypeId);

        List<Board> boards = boardRepository.findByPTypeIdAndVisible(pTypeId);
        log.info("🔍 [DEBUG] DB에서 조회된 Board 개수: {}", boards.size());
        for (Board board : boards) {
            log.info("🔍 [DEBUG] Board: pId={}, pTypeId={}, pTitle={}", 
                board.getPId(), board.getPTypeId(), board.getPTitle());
        }

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

                    // 이미지 URL 처리: S3 Key → Presigned URL 변환
                    String imageUrl = convertToPresignedUrl(board.getPImageUrl());

                    BoardListResponse response = BoardListResponse.from(board, typeName, trainerName, viewCount);
                    response.setPImageUrl(imageUrl);  // Presigned URL로 교체
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * 게시글 상세 조회 (유저용)
     * @param pId 게시글 ID
     * @param uId 로그인한 유저 ID (null 가능 - 비로그인 사용자)
     * @return 게시글 상세 정보
     */
    @Transactional
    public BoardResponse getBoardDetail(Long pId, Long uId) {
        log.info("📄 게시글 상세 조회: pId={}, uId={}", pId, uId);

        Board board = boardRepository.findByIdAndVisible(pId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + pId));

        // 로그인한 유저인 경우 조회수 기록
        if (uId != null) {
            log.info("🔍 [DEBUG] 조회수 기록 시도 - pId={}, uId={}", pId, uId);
            recordBoardView(pId, uId);
        } else {
            log.warn("🔍 [DEBUG] uId가 null이라 조회수 기록 안함 - pId={}", pId);
        }

        // 타입 이름 조회
        String typeName = getBoardTypeName(board.getPTypeId());

        // 트레이너 이름 조회
        String trainerName = getTrainerName(board.getTId());

        // 조회수 조회
        Long viewCount = boardViewerRepository.countByPId(board.getPId());

        // 이미지 URL 처리: S3 Key → Presigned URL 변환
        String imageUrl = convertToPresignedUrl(board.getPImageUrl());

        BoardResponse response = BoardResponse.fromFull(board, typeName, trainerName, viewCount);
        response.setPImageUrl(imageUrl);  // Presigned URL로 교체

        return response;
    }

    /**
     * 게시글 조회 기록 저장
     * - 하루에 한 번만 카운트 (같은 날짜에 여러 번 봐도 1회)
     * @param pId 게시글 ID
     * @param uId 유저 ID
     */
    @Transactional
    public void recordBoardView(Long pId, Long uId) {
        log.info("🔍 [DEBUG] recordBoardView 호출 - pId={}, uId={}", pId, uId);
        
        // 오늘 날짜 범위 설정 (00:00:00 ~ 23:59:59)
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        log.info("🔍 [DEBUG] 조회 기록 확인 - startOfDay={}, endOfDay={}", startOfDay, endOfDay);

        // 오늘 이미 조회한 기록이 있는지 확인
        boolean alreadyViewed = boardViewerRepository.existsByPIdAndUIdToday(
                pId, uId, startOfDay, endOfDay
        );

        log.info("🔍 [DEBUG] 오늘 이미 조회함? {}", alreadyViewed);

        if (!alreadyViewed) {
            // 새로운 조회 기록 저장
            BoardViewer viewer = BoardViewer.builder()
                    .pId(pId)
                    .uId(uId)
                    .date(LocalDateTime.now())
                    .build();

            log.info("🔍 [DEBUG] 저장할 BoardViewer: pId={}, uId={}, date={}", viewer.getPId(), viewer.getUId(), viewer.getDate());

            BoardViewer saved = boardViewerRepository.save(viewer);
            log.info("✅ 게시글 조회 기록 저장: pId={}, uId={}, savedId={}", pId, uId, saved != null ? "SUCCESS" : "FAILED");
        } else {
            log.debug("⏭️ 이미 오늘 조회한 게시글: pId={}, uId={}", pId, uId);
        }
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

                    // 이미지 URL 처리: S3 Key → Presigned URL 변환
                    String imageUrl = convertToPresignedUrl(board.getPImageUrl());

                    BoardResponse response = BoardResponse.fromFull(board, typeName, trainerName, viewCount);
                    response.setPImageUrl(imageUrl);
                    return response;
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

    /**
     * S3 Key를 Presigned URL로 변환 (이미지 조회용)
     * - S3 Key가 이미 URL 형태면 그대로 반환
     * - S3 Key 형태면 Presigned URL 생성 (24시간 유효)
     *
     * @param s3KeyOrUrl S3 Key 또는 URL
     * @return Presigned URL
     */
    private String convertToPresignedUrl(String s3KeyOrUrl) {
        if (s3KeyOrUrl == null || s3KeyOrUrl.trim().isEmpty()) {
            return null;
        }

        // 이미 URL 형태면 그대로 반환 (하위 호환성)
        if (S3Util.isS3Url(s3KeyOrUrl)) {
            return s3KeyOrUrl;
        }

        // S3 Key 형태면 Presigned URL 생성
        try {
            return s3PresignService.getDownloadUrl(
                    bucketName,
                    s3KeyOrUrl,
                    Duration.ofHours(24)  // 24시간 유효
            );
        } catch (Exception e) {
            log.error("❌ Presigned URL 생성 실패: key={}", s3KeyOrUrl, e);
            return s3KeyOrUrl;  // 실패 시 원본 반환
        }
    }
}
