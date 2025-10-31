package com.my.back.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * S3 업로드 URL 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UploadUrlResponse {

    /** S3 저장 키 */
    private String key;

    /** Presigned PUT URL */
    private String putUrl;

    /** 이미지 DB ID (저장 완료 후) */
    private Long imageId;
}
