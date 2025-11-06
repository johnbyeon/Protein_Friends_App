// src/main/java/com/my/back/service/CartServiceImpl.java
package com.my.back.service;

import com.my.back.dto.market.*;
import com.my.back.entity.*;
import com.my.back.repository.*;
import com.my.back.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * CartService 구현체
 * - NPE/음수/중복/기간검증/N+1 방지에 초점
 * - 금액 계산: (세일가 우선) → 소계 → 쿠폰차감 → 라인합계
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartServiceImpl implements CartService {

    private static final BigDecimal FREE_SHIPPING_AT = BigDecimal.valueOf(50_000);
    private static final BigDecimal SHIPPING_FEE = BigDecimal.valueOf(3_000);

    private final CartItemRepository     cartItemRepository;
    private final UserRepository         userRepository;
    private final ProductsRepository     productsRepository;
    private final ProductMediaRepository productMediaRepository;
    private final DiscountLogRepository  discountLogRepository;

    // ---------------- 담기 ----------------
    @Override
    @Transactional
    public void addItems(String email, CartAddRequest req) {
        Users me = mustGetUser(email);
        List<CartItemDto> items = Optional.ofNullable(req.getItems()).orElseGet(List::of);
        if (items.isEmpty()) return;

        for (CartItemDto it : items) {
            if (it.getProductId() == null || it.getQuantity() == null || it.getQuantity() < 1) continue;

            cartItemRepository.findByUIdAndProdId(me.getUId(), it.getProductId())
                    .ifPresentOrElse(line -> {
                        // 기존 라인: 수량 누적 + 선택/쿠폰 동기화(옵션)
                        line.setQuantity(Math.max(1, line.getQuantity() + it.getQuantity()));
                        if (it.getSelected() != null) line.setSelected(it.getSelected());
                        if (it.getAppliedDiscountId() != null) line.setAppliedRecDisId(it.getAppliedDiscountId());
                    }, () -> {
                        // 신규 라인
                        CartItem line = CartItem.builder()
                                .uId(me.getUId())
                                .prodId(it.getProductId())
                                .quantity(Math.max(1, it.getQuantity()))
                                .selected(Optional.ofNullable(it.getSelected()).orElse(true))
                                .appliedRecDisId(it.getAppliedDiscountId())
                                .build();
                        cartItemRepository.save(line);
                    });
        }
    }

    // ---------------- 조회(표) ----------------
    @Override
    public List<CartLineView> getLines(String email) {
        Users me = mustGetUser(email);
        List<CartItem> lines = cartItemRepository.findByUIdOrderByCreateAtAsc(me.getUId());
        if (lines.isEmpty()) return List.of();

        List<Long> prodIds = lines.stream().map(CartItem::getProdId).toList();
        Map<Long, Products> prodMap = productsRepository.findAllById(prodIds)
                .stream().collect(Collectors.toMap(Products::getId, p -> p));
        Map<Long, String> primaryMap = primaryImages(prodIds);

        List<CartLineView> out = new ArrayList<>();
        for (CartItem line : lines) {
            Products p = prodMap.get(line.getProdId());
            if (p == null) continue; // 삭제/비공개 상품 방어

            Price price = priceOf(p);
            BigDecimal unit = price.effective; // 표시단가
            BigDecimal lineSubtotal = unit.multiply(BigDecimal.valueOf(line.getQuantity()));

            BigDecimal couponDiscount = BigDecimal.ZERO;
            if (line.getAppliedRecDisId() != null) {
                couponDiscount = couponForLine(me.getUId(), line.getAppliedRecDisId(), lineSubtotal);
            }
            BigDecimal lineTotal = lineSubtotal.subtract(couponDiscount);
            if (lineTotal.signum() < 0) lineTotal = BigDecimal.ZERO;

            ProductListItemDto productDto = ProductListItemDto.builder()
                    .id(p.getId())
                    .sku(p.getSku())
                    .name(p.getName())
                    .primaryImageUrl(primaryMap.get(p.getId()))
                    .stockQty(p.getStockQty())
                    .price(price.price)
                    .salePrice(price.sale)
                    .discountAmount(price.price.subtract(price.effective).max(BigDecimal.ZERO))
                    .effectivePrice(price.effective)
                    .build();

            CartItemDto lineDto = CartItemDto.builder()
                    .productId(line.getProdId())
                    .quantity(line.getQuantity())
                    .selected(line.getSelected())
                    .appliedDiscountId(line.getAppliedRecDisId())
                    .build();

            out.add(new CartLineView(lineDto, productDto, lineSubtotal, couponDiscount, lineTotal));
        }
        return out;
    }

    // ---------------- 수량 ----------------
    @Override
    @Transactional
    public void updateQuantity(String email, Long productId, int quantity) {
        if (quantity < 1) throw new IllegalArgumentException("quantity는 1 이상이어야 합니다.");
        Users me = mustGetUser(email);
        CartItem line = cartItemRepository.findByUIdAndProdId(me.getUId(), productId)
                .orElseThrow(() -> new NoSuchElementException("장바구니에 없는 상품입니다."));
        line.setQuantity(quantity);
    }

    // ---------------- 선택 ----------------
    @Override
    @Transactional
    public void select(String email, Long productId, boolean selected) {
        Users me = mustGetUser(email);
        CartItem line = cartItemRepository.findByUIdAndProdId(me.getUId(), productId)
                .orElseThrow(() -> new NoSuchElementException("장바구니에 없는 상품입니다."));
        line.setSelected(selected);
    }

    // ---------------- 선택 삭제 ----------------
    @Override
    @Transactional
    public void deleteSelected(String email, List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) return;
        Users me = mustGetUser(email);
        cartItemRepository.deleteByUIdAndProdIdIn(me.getUId(), productIds);
    }

    // ---------------- 쿠폰 ----------------
    @Override
    @Transactional
    public void applyCoupon(String email, Long productId, Long recDisId) {
        Users me = mustGetUser(email);
        CartItem line = cartItemRepository.findByUIdAndProdId(me.getUId(), productId)
                .orElseThrow(() -> new NoSuchElementException("장바구니에 없는 상품입니다."));

        if (recDisId == null) { // 해제
            line.setAppliedRecDisId(null);
            return;
        }
        // 내 쿠폰 + 사용 가능성 검증
        discountLogRepository.findOwned(me.getUId(), recDisId)
                .orElseThrow(() -> new IllegalArgumentException("해당 쿠폰을 사용할 수 없습니다."));
        line.setAppliedRecDisId(recDisId);
    }

    // ---------------- 배지 ----------------
    @Override
    public int countLines(String email) {
        Users me = mustGetUser(email);
        return (int) cartItemRepository.countByUId(me.getUId());
    }

    // ---------------- 결제 요약 ----------------
    @Override
    public Totals summarize(String email) {
        List<CartLineView> lines = getLines(email); // 동일 계산 경로 재사용
        int selected = 0;
        BigDecimal sumGoods = BigDecimal.ZERO;
        BigDecimal sumCoupon = BigDecimal.ZERO;

        for (CartLineView v : lines) {
            if (Boolean.TRUE.equals(v.line().getSelected())) {
                selected++;
                sumGoods  = sumGoods.add(v.lineSubtotal());
                sumCoupon = sumCoupon.add(v.couponDiscount());
            }
        }
        BigDecimal afterDiscount = sumGoods.subtract(sumCoupon);
        if (afterDiscount.signum() < 0) afterDiscount = BigDecimal.ZERO;

        BigDecimal delivery = afterDiscount.compareTo(FREE_SHIPPING_AT) >= 0 ? BigDecimal.ZERO : SHIPPING_FEE;
        BigDecimal pay = afterDiscount.add(delivery);

        return new Totals(selected, sumGoods, sumCoupon, delivery, pay);
    }

    // ================= 내부 유틸 =================

    private Users mustGetUser(String email) {
        if (email == null || email.isBlank()) throw new IllegalStateException("인증 정보가 없습니다.");
        Users me = userRepository.findByEmail(email);
        if (me == null) throw new NoSuchElementException("유저를 찾을 수 없습니다. email=" + email);
        return me;
    }

    /** 대표이미지 1장 맵 */
    private Map<Long, String> primaryImages(List<Long> prodIds) {
        if (prodIds.isEmpty()) return Map.of();
        return productMediaRepository.findByProdIdInOrderByIsPrimaryDescSortOrderAsc(prodIds)
                .stream()
                .collect(Collectors.groupingBy(
                        ProductMedia::getProdId,
                        LinkedHashMap::new,
                        Collectors.mapping(ProductMedia::getProdUrl, Collectors.toList())
                ))
                .entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().get(0)));
    }

    /** 표시가 계산(세일 우선) */
    private Price priceOf(Products p) {
        BigDecimal price = toBD(p.getPrice());
        BigDecimal sale  = toBD(p.getSalePrice());
        BigDecimal eff   = (sale != null && sale.signum() > 0) ? sale : price;
        if (eff == null) eff = BigDecimal.ZERO;
        if (price == null) price = eff;
        return new Price(price, sale, eff);
    }

    /** 라인 쿠폰 차감액(유효성 재검증 포함) */
    private BigDecimal couponForLine(Long uId, Long recDisId, BigDecimal lineSubtotal) {
        DiscountLog dl = discountLogRepository.findOwned(uId, recDisId)
                .orElseThrow(() -> new IllegalArgumentException("쿠폰을 사용할 수 없습니다."));
        DiscountService ds = dl.getDiscountService();

        // 타입/기간/최소금액
        if (Boolean.FALSE.equals(ds.getIsActive())) return BigDecimal.ZERO;
        if (ds.getDisType() != DiscountType.PRODUCT_DISCOUNT) return BigDecimal.ZERO;
        LocalDateTime now = LocalDateTime.now();
        if (ds.getDisStartDate() != null && ds.getDisStartDate().isAfter(now)) return BigDecimal.ZERO;
        if (ds.getDisEndDate()   != null && ds.getDisEndDate().isBefore(now)) return BigDecimal.ZERO;
        if (ds.getDisThresholdAmount() != null &&
                lineSubtotal.compareTo(BigDecimal.valueOf(ds.getDisThresholdAmount())) < 0) {
            return BigDecimal.ZERO;
        }

        // 정액/정률
        BigDecimal amount = BigDecimal.ZERO;
        if (ds.getDisPrice() != null && ds.getDisPrice() > 0) {
            amount = BigDecimal.valueOf(ds.getDisPrice());
        } else if (ds.getDisPercent() != null && ds.getDisPercent() > 0) {
            amount = lineSubtotal
                    .multiply(BigDecimal.valueOf(ds.getDisPercent()))
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
        }
        if (amount.compareTo(lineSubtotal) > 0) amount = lineSubtotal;
        if (amount.signum() < 0) amount = BigDecimal.ZERO;
        return amount;
    }

    private BigDecimal toBD(Double d) { return d == null ? null : BigDecimal.valueOf(d); }

    /** 금액 계산 홀더 */
    private record Price(BigDecimal price, BigDecimal sale, BigDecimal effective) {}
}
