// src/main/java/com/my/back/dto/market/CartItemDto.java
package com.my.back.dto.market;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.groups.Default;
import lombok.*;

/**
 * 장바구니 단건 DTO
 *
 * ─ Add 그룹(POST /shop/cart):
 *    - productId: 필수
 *    - quantity : 필수(기본값 1), 1 이상
 *
 * ─ Update 그룹(PATCH /shop/cart/item 등):
 *    - productId: 필수(어떤 라인인지 식별)
 *    - quantity/selected/appliedDiscountId: 선택(null이면 서비스에서 '미변경')
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CartItemDto {

    public interface Add extends Default {}     // POST /shop/cart
    public interface Update extends Default {}  // PATCH /shop/cart/item

    /** 상품 ID (Add/Update 공통 필수) */
    @NotNull(groups = {Add.class, Update.class})
    private Long productId;

    /** 수량: Add에서는 필수(기본 1), Update에서는 선택(미전송 시 미변경) */
    @NotNull(groups = {Add.class})
    @Min(value = 1, groups = {Add.class})
    @Builder.Default
    private Integer quantity = 1;

    /** 선택 체크박스: Update 전용(null이면 변경 없음) */
    private Boolean selected;

    /** 적용 쿠폰 ID: Update 전용(null이면 해제/미적용은 서비스 정책에 따름) */
    private Long appliedDiscountId;
}
