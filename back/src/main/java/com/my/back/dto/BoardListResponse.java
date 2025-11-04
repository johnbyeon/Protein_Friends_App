package com.my.back.dto;

import com.my.back.entity.Board;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 게시글 목록 응답 DTO (간소화 버전)
 * - 게시글 목록 조회 시 사용 (상세 내용 제외)
 */
@Data
@Builder
public class BoardListResponse {
    /**
     * 게시글 ID
     */
    private Long pId;

    /**
     * 게시글 타입 ID
     */
    private Long pTypeId;

    /**
     * 게시글 타입 이름
     */
    private String pTypeName;

    /**
     * 작성 트레이너 이름
     */
    private String trainerName;

    /**
     * 게시글 제목
     */
    private String pTitle;

    /**
     * 게시글 썸네일 이미지 URL
     */
    private String pImageUrl;

    /**
     * 팝업 여부
     */
    private Boolean pIsPopup;

    /**
     * 게시글 작성일시
     */
    private LocalDateTime pCreateDate;

    /**
     * 조회수
     */
    private Long viewCount;

    /**
     * Entity -> DTO 변환
     */
    public static BoardListResponse from(Board entity, String typeName, String trainerName, Long viewCount) {
        return BoardListResponse.builder()
                .pId(entity.getPId())
                .pTypeId(entity.getPTypeId())
                .pTypeName(typeName)
                .trainerName(trainerName)
                .pTitle(entity.getPTitle())
                .pImageUrl(entity.getPImageUrl())
                .pIsPopup(entity.getPIsPopup())
                .pCreateDate(entity.getPCreateDate())
                .viewCount(viewCount != null ? viewCount : 0L)
                .build();
    }
}
