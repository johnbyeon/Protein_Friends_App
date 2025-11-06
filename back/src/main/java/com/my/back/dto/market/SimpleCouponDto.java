// src/main/java/com/my/back/dto/market/SimpleCouponDto.java
package com.my.back.dto.market;

import lombok.*;

/** 쿠폰 최소 정보 (회원권/상품 공용으로 사용 가능) */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SimpleCouponDto {
    private Long recDisId;   // discount_log.rec_dis_id (보유 쿠폰 ID)
    private String name;     // 쿠폰명
    private Integer price;   // 정액(원) — 없으면 0
    private Integer percent; // 정률(%) — 없으면 0
}
