// src/main/java/com/my/back/dto/market/PayResultDto.java
package com.my.back.dto.market;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** 결제/완료 공통 응답(주문번호 요약) */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PayResultDto {
    private String orderId;
    private String paymentKey;
    private BigDecimal amount;
    private String status;            // DONE 등
    private LocalDateTime paidAt;
}
