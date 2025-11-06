// src/main/java/com/my/back/service/CartService.java
package com.my.back.service;

import com.my.back.dto.market.CartAddRequest;
import com.my.back.dto.market.CartItemDto;
import com.my.back.dto.market.ProductListItemDto;

import java.math.BigDecimal;
import java.util.List;

public interface CartService {

    /** 담기(여러 개) — 같은 상품이면 수량 합산 */
    void addItems(String email, CartAddRequest req);

    /** 장바구니 라인 조회(상품 썸네일/가격 계산 포함) */
    List<CartLineView> getLines(String email);

    /** 수량 변경 */
    void updateQuantity(String email, Long productId, int quantity);

    /** 선택/해제 */
    void select(String email, Long productId, boolean selected);

    /** 선택 삭제(체크한 것만) */
    void deleteSelected(String email, List<Long> productIds);

    /** 쿠폰 적용/해제(null이면 해제) */
    void applyCoupon(String email, Long productId, Long recDisId);

    /** 상단 배지(라인 개수) */
    int countLines(String email);

    /** 하단 결제 요약(선택된 라인 기준 합계) */
    Totals summarize(String email);

    // ---------- 응답용 뷰 모델(새 파일 만들지 않기 위해 내부 타입으로 제공) ----------
    record CartLineView(
            CartItemDto line,                // 수량/선택/쿠폰
            ProductListItemDto product,      // 상품 썸네일/가격 요약 (재사용)
            BigDecimal lineSubtotal,         // 수량 x 유효가(할인 적용 전)
            BigDecimal couponDiscount,       // 쿠폰 차감액(있으면)
            BigDecimal lineTotal             // 최종 라인 합계
    ) {}

    record Totals(
            int selectedCount,
            BigDecimal sumGoodsAmount,       // 총 상품금액(선택된 라인)
            BigDecimal sumDiscountAmount,    // 총 할인금액(세일+쿠폰)
            BigDecimal deliveryFee,          // 배송비(정책에 맞게)
            BigDecimal payAmount             // 총 결제금액
    ) {}
}

