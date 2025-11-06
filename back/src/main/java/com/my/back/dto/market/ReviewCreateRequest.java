// src/main/java/com/my/back/dto/market/ReviewCreateRequest.java
package com.my.back.dto.market;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

/** 리뷰 작성 요청 (사진은 S3 presign 업로드 후 URL 배열로 전달) */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewCreateRequest {
    @NotNull @Min(1) @Max(5)
    private Integer rating;                 // 별점 1~5

    @NotBlank
    private String subtitle;                // 한줄평

    @NotBlank
    private String content;                 // 본문

    @Size(max = 4)
    private List<@NotBlank String> imageUrls; // 첨부 사진 URL 최대 4
}
