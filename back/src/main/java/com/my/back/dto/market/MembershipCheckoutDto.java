// src/main/java/com/my/back/dto/market/MembershipCheckoutDto.java
package com.my.back.dto.market;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/** 회원권 주문서 화면 DTO */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MembershipCheckoutDto {
    private MembershipDto item;              // 구매 대상 회원권
    private List<SimpleCouponDto> coupons;   // 적용 가능 쿠폰(회원권 전용)
    private BigDecimal goodsAmount;          // 상품금액(세일가 우선)
    private BigDecimal couponDiscount;       // 쿠폰 차감액(초기 0)
    private BigDecimal payAmount;            // 최종결제금액(초기 goodsAmount)
}
