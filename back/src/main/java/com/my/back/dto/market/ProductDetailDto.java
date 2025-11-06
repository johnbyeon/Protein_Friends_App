// src/main/java/com/my/back/dto/market/ProductDetailDto.java
package com.my.back.dto.market;

import com.my.back.entity.ProductStatus; // 상품 상태 (ACTIVE/INACTIVE)
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

/** /shop/products/{productId} 응답 DTO */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductDetailDto {

    // 상품 기본정보
    private Long   id;            // 상품 ID
    private String sku;           // 상품 코드
    private String name;          // 상품명
    private String subtitle;      // 한줄 설명
    private String detailHtml;    // 상세 설명(HTML)
    private Integer stockQty;     // 재고 수량
    private ProductStatus status; // 판매 상태

    // 가격 정보
    private BigDecimal price;          // 정가
    private BigDecimal salePrice;      // 세일가 (없을 수 있음)
    private BigDecimal discountAmount; // 할인금액
    private BigDecimal effectivePrice; // 실제 결제금액

    // 상품 이미지 정보
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Image {
        private String  url;        // 이미지 주소
        private boolean primary;    // 대표 이미지 여부
        private Integer sortOrder;  // 정렬 순서
        private String  altText;    // 대체 텍스트
    }
    private List<Image> images;      // 이미지 리스트 (최대 4장)

    // 리뷰 요약
    private Double  ratingAvg;       // 평균 평점
    private Integer ratingCount;     // 리뷰 개수
}
