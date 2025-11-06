package com.my.back.dto;

import com.my.back.entity.BoardType;
import lombok.Builder;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 게시글 타입 응답 DTO
 */
@Data
@Builder
public class BoardTypeResponse {
    /**
     * 게시글 타입 ID
     */
    @JsonProperty("pTypeId")
    private Long pTypeId;

    /**
     * 게시글 타입의 URL 주소 이름
     * 예: "notices", "events", "benefits"
     */
    @JsonProperty("pTypeAddressName")
    private String pTypeAddressName;

    /**
     * 게시글 타입의 한글 이름
     * 예: "공지사항", "이벤트", "혜택"
     */
    @JsonProperty("pTypeName")
    private String pTypeName;

    /**
     * 표시 순서
     */
    private Integer displayOrder;

    /**
     * Entity -> DTO 변환
     */
    public static BoardTypeResponse from(BoardType entity) {
        return BoardTypeResponse.builder()
                .pTypeId(entity.getPTypeId())
                .pTypeAddressName(entity.getPTypeAddressName())
                .pTypeName(entity.getPTypeName())
                .displayOrder(entity.getDisplayOrder())
                .build();
    }
}
