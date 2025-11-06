// src/main/java/com/my/back/service/MembershipPurchaseService.java
package com.my.back.service;

import com.my.back.dto.market.MembershipCheckoutDto;
import com.my.back.dto.market.MembershipDto;
import com.my.back.dto.market.PayResultDto;

import java.util.List;

/** 기간제 회원권: 목록/주문서/결제/완료 */
public interface MembershipPurchaseService {

    /** 판매중 회원권 리스트 */
    List<MembershipDto> listActive();

    /** 회원권 주문서(쿠폰 후보, 금액 요약) */
    MembershipCheckoutDto checkout(String email, Long msId);

    /** 결제(쿠폰 선택적 적용 → 결제로그+회원권 발급) */
    PayResultDto pay(String email, Long msId, Long recDisId);

    /** 결제 완료 요약 조회(주문번호) */
    PayResultDto complete(String orderId);
}
