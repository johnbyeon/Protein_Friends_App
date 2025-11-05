package com.my.back.dto.common;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 공통 페이징 응답 DTO
 * - Spring의 Page<T> 객체를 REST API 응답 포맷으로 변환
 * - 프론트엔드가 페이지네이션 처리하기 쉽게 표준 구조로 제공
 *
 * @param <T> 응답 데이터 타입
 */
public record PageResponse<T>(
        List<T> content,      // 페이지 데이터 목록
        int page,             // 현재 페이지 번호 (0부터 시작)
        int size,             // 페이지 당 데이터 수
        long totalElements,   // 전체 데이터 개수
        int totalPages,       // 전체 페이지 수
        boolean first,        // 첫 페이지 여부
        boolean last          // 마지막 페이지 여부
) {

    /**
     * Page<T> → PageResponse<T> 변환 메서드
     * Page 객체를 받아 동일 정보 DTO로 재구성
     */
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }
}
