package com.my.back.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 게시글 테이블 (9_1. board)
 * - 컬럼명/제약/타입/기본값 100% 문서 준수
 * - p_id: auto increment PK
 */
@Entity
@Table(name = "board")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board {

    /**
     * 게시글 아이디 (PK, auto increment)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "p_id", nullable = false)
    @JsonProperty("pId")
    private Long pId;

    /**
     * 게시글 타입 번호 (not null)
     */
    @Column(name = "p_type_id", nullable = false)
    @JsonProperty("pTypeId")
    private Long pTypeId;

    /**
     * 트레이너 등록번호 (not null)
     */
    @Column(name = "t_id", nullable = false)
    @JsonProperty("tId")
    private Long tId;

    /**
     * 게시글 제목 (not null)
     */
    @Column(name = "p_title", nullable = false, length = 200)
    @JsonProperty("pTitle")
    private String pTitle;

    /**
     * 게시글 내용 (not null)
     */
    @Column(name = "p_content", nullable = false, length = 5000)
    @JsonProperty("pContent")
    private String pContent;

    /**
     * 게시글 사진 URL (nullable)
     */
    @Column(name = "p_image_url", length = 500)
    @JsonProperty("pImageUrl")
    private String pImageUrl;

    /**
     * 팝업 여부 (default false, not null)
     */
    @Column(name = "p_is_popup", nullable = false)
    @Builder.Default
    @JsonProperty("pIsPopup")
    private Boolean pIsPopup = false;

    /**
     * 상시 팝업 여부 (default false, not null)
     */
    @Column(name = "is_always_popup", nullable = false)
    @Builder.Default
    @JsonProperty("isAlwaysPopup")
    private Boolean isAlwaysPopup = false;

    /**
     * 팝업 시작 기간 (nullable)
     */
    @Column(name = "p_popup_start_date")
    @JsonProperty("pPopupStartDate")
    private LocalDate pPopupStartDate;

    /**
     * 팝업 종료 기간 (nullable)
     */
    @Column(name = "p_popup_end_date")
    @JsonProperty("pPopupEndDate")
    private LocalDate pPopupEndDate;

    /**
     * 링크 URL (nullable)
     */
    @Column(name = "p_link", length = 500)
    @JsonProperty("pLink")
    private String pLink;

    /**
     * 팝업 기간 제한 없음 (default false, not null)
     */
    @Column(name = "is_unlimited", nullable = false)
    @Builder.Default
    @JsonProperty("isUnlimited")
    private Boolean isUnlimited = false;

    /**
     * 게시글 작성일시 (not null, 자동 생성)
     */
    @CreatedDate
    @Column(name = "p_create_date", nullable = false, updatable = false)
    @JsonProperty("pCreateDate")
    private LocalDateTime pCreateDate;

    /**
     * 게시글 수정일시 (not null, 자동 갱신)
     */
    @LastModifiedDate
    @Column(name = "p_update_date", nullable = false)
    @JsonProperty("pUpdateDate")
    private LocalDateTime pUpdateDate;

    /**
     * 게시글 노출 여부 (default true, not null)
     */
    @Column(name = "p_set_visible", nullable = false)
    @Builder.Default
    @JsonProperty("pSetVisible")
    private Boolean pSetVisible = true;

    // === 관계 매핑 (LAZY) ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t_id", insertable = false, updatable = false)
    private TrainerInfo trainer;
}