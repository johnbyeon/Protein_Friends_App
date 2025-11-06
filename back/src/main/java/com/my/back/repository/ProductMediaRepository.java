// src/main/java/com/my/back/repository/ProductMediaRepository.java
package com.my.back.repository;

import com.my.back.entity.ProductMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

/** 상품 이미지 리포지토리 */
public interface ProductMediaRepository extends JpaRepository<ProductMedia, Long> {

    // 상품 ID로 이미지 전체 조회 (대표 먼저, 정렬 순서 오름차순)
    List<ProductMedia> findByProdIdOrderByIsPrimaryDescSortOrderAsc(Long prodId);

    // 상품 ID로 대표 이미지 1개 조회
    Optional<ProductMedia> findFirstByProdIdOrderByIsPrimaryDescSortOrderAsc(Long prodId);

    // 여러 상품의 이미지 일괄 조회 (대표 먼저, 정렬 오름차순)
    List<ProductMedia> findByProdIdInOrderByIsPrimaryDescSortOrderAsc(List<Long> prodIds);
}
