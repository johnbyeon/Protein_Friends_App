package com.my.back.dto;

import lombok.Data;

/**
 * 게시글 타입 생성/수정 요청 DTO
 */
@Data
public class BoardTypeRequest {
    /**
     * 게시글 타입의 URL 주소 이름
     * 예: "notices", "events", "benefits"
     */
    private String ptypeaddressName;

    /**
     * 게시글 타입의 한글 이름
     * 예: "공지사항", "이벤트", "혜택"
     */
    private String ptypename;

    /**
     * 표시 순서 (선택사항, 기본값 0)
     */
    private Integer displayOrder;
}
