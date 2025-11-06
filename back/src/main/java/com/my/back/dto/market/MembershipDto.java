// src/main/java/com/my/back/dto/market/MembershipDto.java
package com.my.back.dto.market;

import lombok.*;
import java.math.BigDecimal;

/** 회원권 단건: 목록/체크아웃 공용 (마켓 상품처럼 사용) */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MembershipDto {
    private Long id;               // membership_service PK
    private String code;           // 회원권 번호 (M-20240701-002)
    private String name;           // 3개월 회원권
    private Integer days;          // 기간(일수)
    private String imageUrl;       // 썸네일 (선택)

    private BigDecimal price;          // 정가
    private BigDecimal salePrice;      // 세일가(없으면 null)
    private BigDecimal discountAmount; // 기본할인 = price - effective
    private BigDecimal effectivePrice; // 최종 표시가(세일가 우선)
}
