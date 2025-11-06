// src/main/java/com/my/back/controller/MarketController.java
package com.my.back.controller;

import com.my.back.dto.market.*;
import com.my.back.service.CartService;
import com.my.back.service.CheckoutService;
import com.my.back.service.MarketProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.*;

/**
 * ===============================================================
 * ✅ MarketController — 마켓 / 리뷰 / 장바구니 / 결제 통합
 * ---------------------------------------------------------------
 * 🔹 마켓 리스트   : GET  /shop
 * 🔹 상품 상세     : GET  /shop/products/{productId}
 * 🔹 리뷰 목록     : GET  /shop/products/{productId}/reviews
 * 🔹 리뷰 등록     : POST /shop/products/{productId}/reviews
 * 🔹 장바구니      : /shop/cart 이하
 * 🔹 결제(체크아웃): /shop/checkout, /shop/complete
 * ===============================================================
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/shop")
public class MarketController {

    private final MarketProductService marketProductService;
    private final CartService cartService;
    private final CheckoutService checkoutService;

    // ===================== 🏪 마켓 =====================

    /** ✅ 상품 리스트 조회 (검색/페이지) */
    @GetMapping
    public ResponseEntity<ProductListPageDto> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "12") Integer size
    ) {
        ProductListQuery query = ProductListQuery.builder()
                .q(q).page(page).size(size)
                .build();
        return ResponseEntity.ok(marketProductService.listProducts(query));
    }

    /** ✅ 상품 상세 페이지 (상품/리뷰요약/이미지슬라이드) */
    @GetMapping("/products/{productId}")
    public ResponseEntity<ProductDetailDto> detail(@PathVariable Long productId) {
        return ResponseEntity.ok(marketProductService.getProductDetail(productId));
    }

    // ===================== 📝 리뷰 =====================

    /** ✅ 리뷰 목록 조회 (최신순, mine=true 시 내 리뷰만) */
    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<ReviewPageDto> listReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "false") boolean mine,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return ResponseEntity.ok(marketProductService.listReviews(productId, page, size, mine, email));
    }

    /** ✅ 리뷰 등록 (JWT 필요, 이미지 포함 가능) */
    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<?> createReview(
            @PathVariable Long productId,
            @AuthenticationPrincipal(expression = "username") String email,
            @Valid @RequestBody ReviewCreateRequest req
    ) {
        marketProductService.createReview(productId, email, req);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // ===================== 🛒 장바구니 =====================

    /** ✅ 장바구니 담기(여러개) — 같은 상품은 수량 합산 */
    @PostMapping("/cart")
    public ResponseEntity<List<CartService.CartLineView>> addItems(
            @AuthenticationPrincipal(expression = "username") String email,
            @RequestBody @Valid CartAddRequest req
    ) {
        cartService.addItems(email, req);
        return ResponseEntity.ok(cartService.getLines(email));
    }

    /** ✅ 장바구니 라인 조회 (상품 썸네일/가격 포함) */
    @GetMapping("/cart")
    public ResponseEntity<List<CartService.CartLineView>> addItems(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return ResponseEntity.ok(cartService.getLines(email));
    }

    /** ✅ 수량 변경 (특정 상품의 수량 수정) */
    @PatchMapping("/cart/item/{productId}/qty/{quantity}")
    public ResponseEntity<CartService.CartLineView> updateQty(
            @AuthenticationPrincipal(expression = "username") String email,
            @PathVariable Long productId,
            @PathVariable int quantity
    ) {
        cartService.updateQuantity(email, productId, quantity);
        // 수정된 라인만 다시 조회해서 반환
        var updated = cartService.getLines(email).stream()
                .filter(v -> v.line().getProductId().equals(productId))
                .findFirst().orElse(null);
        return ResponseEntity.ok(updated);
    }

    /** ✅ 선택/해제 (체크박스 토글) */
    @PatchMapping("/cart/item/{productId}/select")
    public ResponseEntity<CartService.CartLineView> select(
            @AuthenticationPrincipal(expression = "username") String email,
            @PathVariable Long productId,
            @RequestParam boolean selected
    ) {
        cartService.select(email, productId, selected);
        var updated = cartService.getLines(email).stream()
                .filter(v -> v.line().getProductId().equals(productId))
                .findFirst().orElse(null);
        return ResponseEntity.ok(updated);
    }

    /** ✅ 선택된 상품 삭제 (체크박스 기준 삭제) */
    @DeleteMapping("/cart/items")
    public ResponseEntity<Void> deleteSelected(
            @AuthenticationPrincipal(expression = "username") String email,
            @RequestBody List<Long> productIds
    ) {
        cartService.deleteSelected(email, productIds);
        return ResponseEntity.ok().build();
    }

    /** ✅ 쿠폰 적용/해제 (recDisId=null이면 해제) */
    @PatchMapping("/cart/item/{productId}/coupon")
    public ResponseEntity<CartService.CartLineView> applyCoupon(
            @AuthenticationPrincipal(expression = "username") String email,
            @PathVariable Long productId,
            @RequestParam(required = false) Long recDisId // null이면 해제
    ) {
        cartService.applyCoupon(email, productId, recDisId);
        var updated = cartService.getLines(email).stream()
                .filter(v -> v.line().getProductId().equals(productId))
                .findFirst().orElse(null);
        return ResponseEntity.ok(updated); // ✅ 라인 DTO 반환
    }

    /** ✅ 결제 요약(선택 라인 기준 합계) */
    @GetMapping("/cart/summary")
    public ResponseEntity<CartService.Totals> summary(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return ResponseEntity.ok(cartService.summarize(email));
    }

    /** ✅ 상단 장바구니 배지용 카운트 */
    @GetMapping("/cart/count")
    public ResponseEntity<Integer> count(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return ResponseEntity.ok(cartService.countLines(email));
    }

    // ===================== 💳 체크아웃 =====================

    /** ✅ 주문서 보기 — 선택된 상품 + 합계 + 결제수단 */
    @GetMapping("/checkout")
    public ResponseEntity<CheckoutPageDto> checkoutPage(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return ResponseEntity.ok(checkoutService.checkoutPage(email));
    }

    /** ✅ 결제 실행(모의 카드결제) — 결제로그 저장/쿠폰처리/라인삭제 */
    @PostMapping("/checkout/pay")
    public ResponseEntity<PayResultDto> pay(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return ResponseEntity.ok(checkoutService.payByCard(email));
    }

    /** ✅ 주문완료 보기 — 결제 요약 반환 */
    @GetMapping("/complete/{orderId}")
    public ResponseEntity<PayResultDto> complete(
            @PathVariable String orderId
    ) {
        return ResponseEntity.ok(checkoutService.completeSummary(orderId));
    }

    // ===================== ⚠️ 공통 예외 처리 =====================

    /** 존재하지 않는 데이터 */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NoSuchElementException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "NOT_FOUND", "message", e.getMessage()));
    }

    /** 요청 형식 오류, 상태 불일치 등 */
    @ExceptionHandler({ MethodArgumentNotValidException.class, BindException.class,
            IllegalArgumentException.class, IllegalStateException.class })
    public ResponseEntity<Map<String, Object>> handleBadRequest(Exception e) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", "BAD_REQUEST", "message", e.getMessage()));
    }

    /** 서버 내부 오류 (예: NullPointerException 등) */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleServerError(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "INTERNAL_SERVER_ERROR", "message", e.getMessage()));
    }
}
