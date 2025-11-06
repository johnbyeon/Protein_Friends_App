// src/main/java/com/my/back/dto/market/ReviewPageDto.java
package com.my.back.dto.market;

import lombok.*;
import java.util.List;

/** 리뷰 페이지 DTO (리뷰 목록 + 페이징 정보) */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewPageDto {

    private List<ReviewItemDto> content; // 리뷰 목록
    private Integer page;                // 현재 페이지
    private Integer size;                // 페이지당 리뷰 수
    private Long totalElements;          // 전체 리뷰 개수
    private Integer totalPages;          // 전체 페이지 수
}
