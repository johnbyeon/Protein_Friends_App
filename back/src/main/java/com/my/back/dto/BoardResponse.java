package com.my.back.dto;

import com.my.back.entity.Board;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 게시글 응답 DTO
 * - 게시글 상세 조회 시 사용
 */
@Data
@Builder
public class BoardResponse {
    /**
     * 게시글 ID
     */
    private Long pId;

    /**
     * 게시글 타입 ID
     */
    private Long pTypeId;

    /**
     * 게시글 타입 이름 (예: "공지사항", "이벤트")
     */
    private String pTypeName;

    /**
     * 작성 트레이너 ID
     */
    private Long tId;

    /**
     * 작성 트레이너 이름
     */
    private String trainerName;

    /**
     * 게시글 제목
     */
    private String pTitle;

    /**
     * 게시글 내용
     */
    private String pContent;

    /**
     * 게시글 이미지 URL
     */
    private String pImageUrl;

    /**
     * 팝업 여부
     */
    private Boolean pIsPopup;

    /**
     * 상시 팝업 여부
     */
    private Boolean isAlwaysPopup;

    /**
     * 팝업 시작 날짜
     */
    private LocalDate pPopupStartDate;

    /**
     * 팝업 종료 날짜
     */
    private LocalDate pPopupEndDate;

    /**
     * 링크 URL
     */
    private String pLink;

    /**
     * 팝업 기간 제한 없음
     */
    private Boolean isUnlimited;

    /**
     * 게시글 작성일시
     */
    private LocalDateTime pCreateDate;

    /**
     * 게시글 수정일시
     */
    private LocalDateTime pUpdateDate;

    /**
     * 게시글 노출 여부
     */
    private Boolean pSetVisible;

    /**
     * 조회수 (BoardViewer 카운트)
     */
    private Long viewCount;

    /**
     * Entity -> DTO 변환 (기본)
     */
    public static BoardResponse from(Board entity) {
        return BoardResponse.builder()
                .pId(entity.getPId())
                .pTypeId(entity.getPTypeId())
                .tId(entity.getTId())
                .pTitle(entity.getPTitle())
                .pContent(entity.getPContent())
                .pImageUrl(entity.getPImageUrl())
                .pIsPopup(entity.getPIsPopup())
                .isAlwaysPopup(entity.getIsAlwaysPopup())
                .pPopupStartDate(entity.getPPopupStartDate())
                .pPopupEndDate(entity.getPPopupEndDate())
                .pLink(entity.getPLink())
                .isUnlimited(entity.getIsUnlimited())
                .pCreateDate(entity.getPCreateDate())
                .pUpdateDate(entity.getPUpdateDate())
                .pSetVisible(entity.getPSetVisible())
                .viewCount(0L) // 기본값, Service에서 계산
                .build();
    }

    /**
     * Entity -> DTO 변환 (트레이너 정보 포함)
     */
    public static BoardResponse fromWithTrainer(Board entity, String trainerName) {
        BoardResponse response = from(entity);
        response.setTrainerName(trainerName);
        return response;
    }

    /**
     * Entity -> DTO 변환 (타입 이름 포함)
     */
    public static BoardResponse fromWithTypeName(Board entity, String typeName) {
        BoardResponse response = from(entity);
        response.setPTypeName(typeName);
        return response;
    }

    /**
     * Entity -> DTO 변환 (모든 정보 포함)
     */
    public static BoardResponse fromFull(Board entity, String typeName, String trainerName, Long viewCount) {
        BoardResponse response = from(entity);
        response.setPTypeName(typeName);
        response.setTrainerName(trainerName);
        response.setViewCount(viewCount != null ? viewCount : 0L);
        return response;
    }
}
