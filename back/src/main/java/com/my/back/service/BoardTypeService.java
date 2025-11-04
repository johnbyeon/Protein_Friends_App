package com.my.back.service;

import com.my.back.dto.BoardTypeRequest;
import com.my.back.dto.BoardTypeReorderRequest;
import com.my.back.dto.BoardTypeResponse;
import com.my.back.entity.BoardType;
import com.my.back.repository.BoardTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * BoardType Service
 * - 게시글 타입 관리 (CRUD)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BoardTypeService {

    private final BoardTypeRepository boardTypeRepository;

    /**
     * 모든 게시글 타입 조회 (displayOrder 기준 정렬)
     */
    @Transactional(readOnly = true)
    public List<BoardTypeResponse> getAllBoardTypes() {
        log.info("📋 모든 게시글 타입 조회 (displayOrder 정렬)");
        
        // 기본 데이터가 없으면 초기 데이터 생성 (별도 트랜잭션으로)
        if (boardTypeRepository.count() == 0) {
            initializeDefaultBoardTypes();
        }
        
        return boardTypeRepository.findAllOrderByDisplayOrder().stream()
                .map(BoardTypeResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 기본 게시판 타입 초기화
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void initializeDefaultBoardTypes() {
        long count = boardTypeRepository.count();
        if (count > 0) {
            log.info("📋 게시판 타입 데이터 이미 존재 ({}개)", count);
            return;
        }

        log.info("📋 기본 게시판 타입 데이터 생성 시작");
        
        List<BoardType> defaultTypes = Arrays.asList(
            BoardType.builder()
                    .pTypeAddressName("notices")
                    .pTypeName("공지사항")
                    .displayOrder(1)
                    .build(),
            BoardType.builder()
                    .pTypeAddressName("events")
                    .pTypeName("이벤트")
                    .displayOrder(2)
                    .build(),
            BoardType.builder()
                    .pTypeAddressName("benefits")
                    .pTypeName("혜택")
                    .displayOrder(3)
                    .build()
        );

        boardTypeRepository.saveAll(defaultTypes);
        log.info("✅ 기본 게시판 타입 데이터 생성 완료: {}개", defaultTypes.size());
    }

    /**
     * ID로 게시글 타입 조회
     */
    @Transactional(readOnly = true)
    public BoardTypeResponse getBoardTypeById(Long id) {
        log.info("📋 게시글 타입 조회: ID={}", id);
        BoardType boardType = boardTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글 타입을 찾을 수 없습니다: " + id));
        return BoardTypeResponse.from(boardType);
    }

    /**
     * 게시글 타입 생성 (관리자 전용)
     */
    @Transactional
    public BoardTypeResponse createBoardType(BoardTypeRequest request) {
        log.info("➕ 게시글 타입 생성: addressName={}, typeName={}",
                request.getPtypeaddressName(), request.getPtypename());

        // URL 주소 이름 중복 체크
        if (boardTypeRepository.existsByPTypeAddressName(request.getPtypeaddressName())) {
            throw new IllegalArgumentException("이미 사용 중인 URL 주소입니다: " + request.getPtypeaddressName());
        }

        // 다음 ID 계산 (현재 최대 ID + 1)
        Long nextId = boardTypeRepository.findAll().stream()
                .map(BoardType::getPTypeId)
                .max(Long::compareTo)
                .orElse(0L) + 1;

        // displayOrder 기본값 설정 (요청값이 없으면 마지막 순서로)
        Integer displayOrder = request.getDisplayOrder();
        if (displayOrder == null) {
            displayOrder = boardTypeRepository.findAll().stream()
                    .map(BoardType::getDisplayOrder)
                    .max(Integer::compareTo)
                    .orElse(-1) + 1;
        }

        BoardType boardType = BoardType.builder()
                .pTypeId(nextId)
                .pTypeAddressName(request.getPtypeaddressName())
                .pTypeName(request.getPtypename())
                .displayOrder(displayOrder)
                .build();

        BoardType saved = boardTypeRepository.save(boardType);
        log.info("✅ 게시글 타입 생성 완료: ID={}, displayOrder={}", saved.getPTypeId(), saved.getDisplayOrder());

        return BoardTypeResponse.from(saved);
    }

    /**
     * 게시글 타입 수정 (관리자 전용)
     */
    @Transactional
    public BoardTypeResponse updateBoardType(Long id, BoardTypeRequest request) {
        log.info("✏️ 게시글 타입 수정: ID={}", id);

        BoardType boardType = boardTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글 타입을 찾을 수 없습니다: " + id));

        // URL 주소 변경 시 중복 체크
        if (!boardType.getPTypeAddressName().equals(request.getPtypeaddressName())) {
            if (boardTypeRepository.existsByPTypeAddressName(request.getPtypeaddressName())) {
                throw new IllegalArgumentException("이미 사용 중인 URL 주소입니다: " + request.getPtypeaddressName());
            }
        }

        boardType.setPTypeAddressName(request.getPtypeaddressName());
        boardType.setPTypeName(request.getPtypename());

        // displayOrder가 제공된 경우에만 업데이트
        if (request.getDisplayOrder() != null) {
            boardType.setDisplayOrder(request.getDisplayOrder());
        }

        log.info("✅ 게시글 타입 수정 완료: ID={}, displayOrder={}", id, boardType.getDisplayOrder());
        return BoardTypeResponse.from(boardType);
    }

    /**
     * 게시글 타입 삭제 (관리자 전용)
     */
    @Transactional
    public void deleteBoardType(Long id) {
        log.info("🗑️ 게시글 타입 삭제: ID={}", id);

        if (!boardTypeRepository.existsById(id)) {
            throw new IllegalArgumentException("게시글 타입을 찾을 수 없습니다: " + id);
        }

        // TODO: 해당 타입의 게시글이 있는지 확인하고, 있으면 삭제 방지
        // (나중에 Board 엔티티 구현 후 추가)

        boardTypeRepository.deleteById(id);
        log.info("✅ 게시글 타입 삭제 완료: ID={}", id);
    }

    /**
     * 게시글 타입 순서 재배정 (관리자 전용)
     * - ID는 불변으로 유지하고 displayOrder만 변경
     * - 드래그 앤 드롭으로 순서 변경 시 사용
     */
    @Transactional
    public List<BoardTypeResponse> reorderBoardTypes(BoardTypeReorderRequest request) {
        log.info("🔄 게시글 타입 순서 재배정 시작");

        List<BoardTypeReorderRequest.OrderMapping> mappings = request.getOrderMappings();

        if (mappings == null || mappings.isEmpty()) {
            throw new IllegalArgumentException("순서 매핑 리스트가 비어있습니다.");
        }

        // 각 타입의 displayOrder 업데이트
        for (BoardTypeReorderRequest.OrderMapping mapping : mappings) {
            BoardType boardType = boardTypeRepository.findById(mapping.getTypeId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "게시글 타입을 찾을 수 없습니다: " + mapping.getTypeId()));

            boardType.setDisplayOrder(mapping.getNewOrder());
            log.info("  ✅ displayOrder 업데이트: ID={}, newOrder={}",
                    mapping.getTypeId(), mapping.getNewOrder());
        }

        boardTypeRepository.flush(); // 변경 확정

        log.info("✅ 게시글 타입 순서 재배정 완료: {} 개 항목", mappings.size());

        // 정렬된 결과 반환
        return getAllBoardTypes();
    }
}
