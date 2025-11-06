// src/main/java/com/my/back/dto/market/CartLineViewDto.java
package com.my.back.dto.market;

import lombok.*;
import java.math.BigDecimal;

/**
 * 장바구니 표 한 줄(응답 전용)
 * 엔티티 매핑:
 *  - products: prod_id, prod_sku, prod_name, prod_price, prod_sale_price
 *  - product_media: 대표 이미지
 *  - discount_log/discount_service: 쿠폰 표시(선택)
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartLineViewDto {
    // 상품 표시
    private Long productId;
    private String sku;
    private String name;
    private String primaryImageUrl;

    // 상태
    private Integer quantity;
    private boolean selected;

    // 금액 계산
    private BigDecimal price;            // 정상가
    private BigDecimal salePrice;        // 할인가(Nullable)
    private BigDecimal perItemDiscount;  // 개당 추가할인(Nullable => 0으로 취급)
    private BigDecimal unitFinal;        // (saleOrPrice - perItemDiscount)
    private BigDecimal lineSubtotal;     // qty × saleOrPrice
    private BigDecimal lineDiscount;     // qty × perItemDiscount
    private BigDecimal lineTotal;        // lineSubtotal - lineDiscount

    // 적용 쿠폰(선택)
    private Long appliedDiscountId;      // rec_dis_id
    private String appliedDiscountName;  // dis_name
}
