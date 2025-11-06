// src/main/java/com/my/back/service/MarketProductService.java
package com.my.back.service;

import com.my.back.dto.market.*;

public interface MarketProductService {

    /** 마켓 리스트(검색/페이지 + 리뷰요약/썸네일/가격계산) */
    ProductListPageDto listProducts(ProductListQuery query);

    /** 상품 상세(이미지 슬라이드 + 리뷰요약 + 가격계산) */
    ProductDetailDto getProductDetail(Long productId);

    /** 상세 팝업 - 리뷰 탭 페이징 조회 (mine=true면 내 리뷰만) */
    ReviewPageDto listReviews(Long productId, int page, int size, boolean mine, String email);

    /** 상세 팝업 - 리뷰 등록 (사진 URL 최대 4장) */
    void createReview(Long productId, String email, ReviewCreateRequest req);
}
