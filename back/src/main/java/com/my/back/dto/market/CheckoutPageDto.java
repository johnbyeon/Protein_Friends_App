// src/main/java/com/my/back/dto/market/CheckoutPageDto.java
package com.my.back.dto.market;

import com.my.back.service.CartService;
import lombok.*;
import java.util.List;

/** 주문서 화면 DTO(선택 라인 + 합계 + 결제수단) */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckoutPageDto {
    private List<CartService.CartLineView> items; // 재사용
    private CartService.Totals totals;            // 재사용
    @Builder.Default
    private List<String> paymentMethods = List.of("CARD");
}
