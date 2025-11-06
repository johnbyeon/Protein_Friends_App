// src/main/java/com/my/back/service/CheckoutService.java
package com.my.back.service;

import com.my.back.dto.market.CheckoutPageDto;
import com.my.back.dto.market.PayResultDto;

public interface CheckoutService {

    /** 주문서 화면 데이터(선택 라인 + 합계 + 결제수단) */
    CheckoutPageDto checkoutPage(String email);

    /** 카드 결제(모의): 주문 생성 + 결제로그 저장 + 쿠폰 사용처리 + 장바구니 정리 */
    PayResultDto payByCard(String email);

    /** 주문완료 요약(결제키/금액/상태/시간) */
    PayResultDto completeSummary(String orderId);
}
