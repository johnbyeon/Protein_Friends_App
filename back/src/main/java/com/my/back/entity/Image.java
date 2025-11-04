package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 이미지 업로드 기록 테이블
 * S3에 업로드된 이미지 메타데이터 저장
 */
@Entity
@Table(name = "images")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Image {

    /** 이미지 고유번호 (PK) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Long imageId;

    /** S3 저장 키 (예: uploads/123/uuid_filename.jpg) */
    @Column(nullable = false, unique = true, length = 500)
    private String s3Key;

    /** 원본 파일명 */
    @Column(nullable = false, length = 255)
    private String originalFilename;

    /** 파일 타입 (예: image/jpeg) */
    @Column(nullable = false, length = 100)
    private String contentType;

    /** 파일 크기 (bytes) */
    @Column(nullable = false)
    private Long fileSize;

    /** 업로드한 사용자 ID */
    @Column(name = "u_id", nullable = false)
    private Long userId;

    /** 이미지 설명 (선택) */
    @Column(length = 500)
    private String description;

    /** 이미지 용도/타입 (PROFILE, MEAL, INBODY, etc.) */
    @Column(length = 50)
    private String imageType;

    /** 업로드 일시 */
    @CreatedDate
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    /** 삭제 여부 */
    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;
}
