// src/main/java/com/my/back/dto/market/ReviewItemDto.java
package com.my.back.dto.market;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

/** 리뷰 한 건 DTO */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewItemDto {

    private Long   reviewId;     // 리뷰 ID
    private String userName;     // 작성자 이름(마스킹 처리)
    private Integer rating;      // 평점(1~5)
    private String subtitle;     // 리뷰 제목
    private String content;      // 리뷰 내용
    private LocalDate date;      // 작성일(yyyy-MM-dd)
    private List<String> images; // 리뷰 이미지 목록(최대 4장)
}
