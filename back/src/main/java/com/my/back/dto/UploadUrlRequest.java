package com.my.back.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * S3 업로드 URL 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UploadUrlRequest {

    /** 원본 파일명 */
    private String filename;

    /** 컨텐츠 타입 (예: image/jpeg) */
    private String contentType;

    /** 파일 크기 (bytes) */
    private Long contentLength;

    /** 이미지 설명 (선택) */
    private String description;

    /** 이미지 타입 (PROFILE, MEAL, INBODY, EXERCISE 등) */
    private String imageType;
}
