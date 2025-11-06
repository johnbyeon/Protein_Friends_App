package com.my.back.dto;

import com.my.back.entity.BoardType;
import lombok.Builder;
import lombok.Data;

/**
 * 게시글 타입 응답 DTO
 */
@Data
@Builder
public class BoardTypeResponse {
    /**
     * 게시글 타입 ID
     */
    private Long ptypeid;

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
     * 표시 순서
     */
    private Integer displayOrder;

    /**
     * Entity -> DTO 변환
     */
    public static BoardTypeResponse from(BoardType entity) {
        return BoardTypeResponse.builder()
                .ptypeid(entity.getPTypeId())
                .ptypeaddressName(entity.getPTypeAddressName())
                .ptypename(entity.getPTypeName())
                .displayOrder(entity.getDisplayOrder())
                .build();
    }
}
