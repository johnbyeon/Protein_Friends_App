// src/main/java/com/my/back/dto/market/CartAddRequest.java
package com.my.back.dto.market;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

/** 체크박스 선택 후 장바구니에 일괄 담기 요청 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartAddRequest {
    @NotEmpty
    @Valid
    private List<CartItemDto> items; // 단건 DTO 재사용(중복 제거)
}
