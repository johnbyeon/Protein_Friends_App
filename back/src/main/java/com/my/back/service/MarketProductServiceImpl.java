// src/main/java/com/my/back/service/MarketProductServiceImpl.java
package com.my.back.service;

import com.my.back.dto.market.*;
import com.my.back.entity.*;
import com.my.back.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MarketProductServiceImpl implements MarketProductService {

    private final ProductsRepository         productsRepository;
    private final ProductMediaRepository     productMediaRepository;
    private final MarketReviewRepository     marketReviewRepository;
    private final MarketReviewPicRepository  marketReviewPicRepository;
    private final UserRepository             userRepository;

    /** ✅ 마켓 상품 리스트 (검색 + 페이지네이션 + 리뷰요약 + 썸네일) */
    @Override
    public ProductListPageDto listProducts(ProductListQuery query) {
        int page = (query.getPage() == null || query.getPage() < 1) ? 1 : query.getPage();
        int size = (query.getSize() == null || query.getSize() < 1) ? 10 : query.getSize();

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Products> productPage = productsRepository.searchByStatusAndQuery(
                ProductStatus.ACTIVE,
                safeTrimOrNull(query.getQ()),
                pageable
        );

        List<Products> rows = productPage.getContent();
        if (rows.isEmpty()) {
            return ProductListPageDto.builder()
                    .content(Collections.emptyList())
                    .page(page).size(size)
                    .totalElements(productPage.getTotalElements())
                    .totalPages(productPage.getTotalPages())
                    .hasPrev(productPage.hasPrevious())
                    .hasNext(productPage.hasNext())
                    .cartCount(0)
                    .build();
        }

        // ID 리스트
        List<Long> ids = rows.stream().map(Products::getId).toList();

        // 대표 이미지 맵
        Map<Long, String> primaryImageMap = buildPrimaryImageMap(ids);

        // 리뷰 요약(평균, 개수)
        Map<Long, RatingPair> ratingMap = buildRatingMap(ids);

        // DTO 매핑
        List<ProductListItemDto> content = rows.stream()
                .map(p -> toListItemDto(p, primaryImageMap.get(p.getId()), ratingMap.get(p.getId())))
                .toList();

        return ProductListPageDto.builder()
                .content(content)
                .page(page).size(size)
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .hasPrev(productPage.hasPrevious())
                .hasNext(productPage.hasNext())
                .cartCount(0)
                .build();
    }

    /** ✅ 상품 상세 (이미지 슬라이드 + 리뷰 요약 + 가격 계산) */
    @Override
    public ProductDetailDto getProductDetail(Long productId) {
        Products p = productsRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("상품을 찾을 수 없습니다. id=" + productId));

        List<ProductMedia> mediaList = productMediaRepository
                .findByProdIdOrderByIsPrimaryDescSortOrderAsc(productId);

        RatingPair rating = summarizeSingle(productId);
        PriceCalc price = calcPrice(p);

        return ProductDetailDto.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .subtitle(p.getSubtitle())
                .detailHtml(p.getDetailHtml())
                .price(price.price)
                .salePrice(price.sale)
                .discountAmount(price.discount)
                .effectivePrice(price.effective)
                .stockQty(p.getStockQty())
                .status(p.getStatus())
                .images(
                        mediaList.stream()
                                .map(m -> ProductDetailDto.Image.builder()
                                        .url(m.getProdUrl())
                                        .primary(Boolean.TRUE.equals(m.getIsPrimary()))
                                        .sortOrder(Optional.ofNullable(m.getSortOrder()).orElse(0))
                                        .altText(Optional.ofNullable(m.getAltText()).orElse(""))
                                        .build())
                                .toList()
                )
                .ratingAvg(rating.avg)
                .ratingCount(rating.cnt)
                .build();
    }

    /** ✅ 리뷰 목록 페이징 (mine=true 이면 내 리뷰만) */
    @Override
    public ReviewPageDto listReviews(Long productId, int page, int size, boolean mine, String email) {
        int p = Math.max(page, 1);
        int s = Math.max(size, 1);

        Pageable pageable = PageRequest.of(p - 1, s); // 정렬은 JPQL에서 처리

        Page<MarketReview> reviewPage;
        if (mine) {
            if (email == null || email.isBlank()) {
                throw new IllegalStateException("인증 정보가 없습니다. (mine=true)");
            }
            Users me = Optional.ofNullable(userRepository.findByEmail(email))
                    .orElseThrow(() -> new NoSuchElementException("유저를 찾을 수 없습니다. email=" + email));

            reviewPage = marketReviewRepository
                    .findPageByProductIdAndUserId(productId, me.getUId(), pageable);
        } else {
            reviewPage = marketReviewRepository
                    .findPageByProductId(productId, pageable);
        }

        List<MarketReview> reviews = reviewPage.getContent();

        // ✅ 사진 N+1 방지: 한 번에 가져와서 groupBy
        Map<Long, List<String>> picMap = reviews.isEmpty()
                ? Collections.emptyMap()
                : marketReviewPicRepository.findAllByReviewIdInOrderByPicIdAsc(
                reviews.stream().map(MarketReview::getPRId).toList()
        ).stream().collect(Collectors.groupingBy(
                MarketReviewPic::getPRId,
                LinkedHashMap::new,
                Collectors.mapping(MarketReviewPic::getPicUrl, Collectors.toList())
        ));

        List<ReviewItemDto> items = reviews.stream().map(r -> {
            String maskedName = userRepository.findById(r.getUId())
                    .map(Users::getName).map(this::maskName).orElse("익명");

            List<String> pics = pic.toUnmodifiableList(picMap.get(r.getPRId()));
            return ReviewItemDto.builder()
                    .reviewId(r.getPRId())
                    .userName(maskedName)
                    .rating(Optional.ofNullable(r.getPRating()).orElse(0))
                    .subtitle(Optional.ofNullable(r.getPReviewSubtitle()).orElse(""))
                    .content(Optional.ofNullable(r.getPReview()).orElse(""))
                    .date(Optional.ofNullable(r.getPDatetime()).map(LocalDateTime::toLocalDate).orElse(LocalDate.now()))
                    .images(pics)
                    .build();
        }).toList();

        return ReviewPageDto.builder()
                .content(items)
                .page(p).size(s)
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .build();
    }

    /** ✅ 리뷰 등록 (사진 URL 최대 4장) */
    @Override
    @Transactional
    public void createReview(Long productId, String email, ReviewCreateRequest req) {
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("인증 정보가 없습니다.");
        }
        Users user = Optional.ofNullable(userRepository.findByEmail(email))
                .orElseThrow(() -> new NoSuchElementException("유저를 찾을 수 없습니다. email=" + email));

        MarketReview review = MarketReview.builder()
                .pId(productId)
                .uId(user.getUId())
                .pRating(req.getRating())
                .pReviewSubtitle(req.getSubtitle())
                .pReview(req.getContent())
                .pDatetime(LocalDateTime.now())
                .build();

        MarketReview saved = marketReviewRepository.save(review);
        Long reviewId = saved.getPRId();

        if (req.getImageUrls() != null) {
            req.getImageUrls().stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(u -> !u.isEmpty())
                    .limit(4)
                    .map(u -> MarketReviewPic.builder().pRId(reviewId).picUrl(u).build())
                    .forEach(marketReviewPicRepository::save);
        }
    }

    // ---------- 내부 유틸 ----------

    private Map<Long, String> buildPrimaryImageMap(List<Long> ids) {
        Map<Long, String> map = new HashMap<>();
        for (Long id : ids) {
            productMediaRepository.findFirstByProdIdOrderByIsPrimaryDescSortOrderAsc(id)
                    .ifPresent(m -> map.put(id, m.getProdUrl()));
        }
        return map;
    }

    private Map<Long, RatingPair> buildRatingMap(List<Long> ids) {
        Map<Long, RatingPair> map = new HashMap<>();
        for (Long id : ids) map.put(id, summarizeSingle(id));
        return map;
    }

    private RatingPair summarizeSingle(Long pId) {
        var summary = marketReviewRepository.summarize(pId);
        double avg = (summary == null || summary.getAvg() == null)
                ? 0.0
                : BigDecimal.valueOf(summary.getAvg()).setScale(1, RoundingMode.HALF_UP).doubleValue();
        int cnt = (summary == null || summary.getCnt() == null) ? 0 : summary.getCnt().intValue();
        return new RatingPair(avg, cnt);
    }

    private ProductListItemDto toListItemDto(Products p, String imageUrl, RatingPair rating) {
        PriceCalc price = calcPrice(p);
        return ProductListItemDto.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .primaryImageUrl(imageUrl)
                .ratingAvg(rating.avg)
                .ratingCount(rating.cnt)
                .stockQty(p.getStockQty())
                .price(price.price)
                .salePrice(price.sale)
                .discountAmount(price.discount)
                .effectivePrice(price.effective)
                .build();
    }

    private PriceCalc calcPrice(Products p) {
        BigDecimal price = toBD(p.getPrice());
        BigDecimal sale  = toBD(p.getSalePrice());

        BigDecimal effective = (sale != null && sale.compareTo(BigDecimal.ZERO) > 0) ? sale : price;
        if (effective == null) effective = BigDecimal.ZERO;
        if (price == null)     price     = effective;

        BigDecimal discount = price.subtract(effective);
        if (discount.compareTo(BigDecimal.ZERO) < 0) discount = BigDecimal.ZERO;

        return new PriceCalc(price, sale, discount, effective);
    }

    private BigDecimal toBD(Double d) { return (d == null) ? null : BigDecimal.valueOf(d); }

    private String safeTrimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    /** 이름 마스킹: 김수 → 김* / 김민수 → 김*수 / 3글자↑는 가운데 * */
    private String maskName(String name) {
        if (name == null || name.isBlank()) return "익명";
        String n = name.trim();
        int len = n.length();
        if (len == 1) return n;
        if (len == 2) return n.charAt(0) + "*";
        StringBuilder sb = new StringBuilder();
        sb.append(n.charAt(0));
        for (int i = 1; i < len - 1; i++) sb.append('*');
        sb.append(n.charAt(len - 1));
        return sb.toString();
    }

    private static final class pic {
        static List<String> toUnmodifiableList(List<String> in) {
            if (in == null) return List.of();
            List<String> trimmed = in.stream().filter(Objects::nonNull).map(String::trim)
                    .filter(s -> !s.isEmpty()).limit(4).toList();
            return List.copyOf(trimmed);
        }
    }

    private record RatingPair(Double avg, Integer cnt) { static RatingPair ZERO = new RatingPair(0.0, 0); }
    private record PriceCalc(BigDecimal price, BigDecimal sale, BigDecimal discount, BigDecimal effective) {}
}
