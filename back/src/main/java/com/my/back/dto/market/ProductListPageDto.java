// src/main/java/com/my/back/dto/market/ProductListPageDto.java
package com.my.back.dto.market;

import lombok.*;

import java.util.List;

/** 리스트 응답(표 + 페이지바 + 장바구니 배지) */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductListPageDto {
    private List<ProductListItemDto> content;

    // 페이지네이션
    private Integer page;          // 현재 페이지(1-base)
    private Integer size;          // 페이지 크기
    private Long totalElements;
    private Integer totalPages;
    private Boolean hasPrev;
    private Boolean hasNext;

    // 상단 “장바구니 담기 (N)” 배지
    @Builder.Default
    private Integer cartCount = 0;
}
