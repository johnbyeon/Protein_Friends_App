// src/main/java/com/my/back/dto/market/ProductListItemDto.java
package com.my.back.dto.market;

import lombok.*;

import java.math.BigDecimal;

/** 마켓 리스트 한 행 표시용 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductListItemDto {
    private Long id;                  // 내부 PK
    private String sku;               // 상품 번호 (예: P-20240701-001)
    private String name;              // 상품명
    private String primaryImageUrl;   // 대표 이미지(썸네일)

    // 리뷰 요약
    private Double ratingAvg;         // 평균 별점
    private Integer ratingCount;      // 리뷰 개수

    // 재고
    private Integer stockQty;

    // 가격(정수/실수 혼선 방지 → BigDecimal 권장)
    private BigDecimal price;         // 정상가
    private BigDecimal salePrice;     // 할인가(없으면 null)
    private BigDecimal discountAmount;// 할인 금액 = price - effectivePrice (>=0)
    private BigDecimal effectivePrice;// 최종 구매가(표시용)
}
