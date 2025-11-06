// src/main/java/com/my/back/dto/market/CartSummaryDto.java
package com.my.back.dto.market;

import lombok.*;
import java.math.BigDecimal;

/** 상단 배지 + 결제 요약 겸용 DTO */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartSummaryDto {

    /** 상단 배지: 담긴 개수(또는 선택 개수) */
    @Builder.Default
    private Integer itemCount = 0;

    /** 결제 요약(선택 라인 기준) */
    @Builder.Default
    private BigDecimal goodsTotal   = BigDecimal.ZERO; // 총 상품 금액(할인 전)
    @Builder.Default
    private BigDecimal discountTotal= BigDecimal.ZERO; // 총 할인 금액
    @Builder.Default
    private BigDecimal shippingFee  = BigDecimal.ZERO; // 배송비
    @Builder.Default
    private BigDecimal grandTotal   = BigDecimal.ZERO; // 최종 결제 금액
}
