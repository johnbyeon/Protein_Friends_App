// src/main/java/com/my/back/dto/market/ProductListQuery.java
package com.my.back.dto.market;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

/** 리스트 검색/페이지 요청 DTO */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductListQuery {
    /** 상품명/상품번호 검색어(null 또는 공백이면 전체) */
    private String q;

    /** 1-base 페이지 번호 */
    @Min(1) @Builder.Default
    private Integer page = 1;

    /** 페이지 크기 */
    @Min(1) @Max(100) @Builder.Default
    private Integer size = 10;
}
