// src/main/java/com/my/back/repository/ProductsRepository.java
package com.my.back.repository;

import com.my.back.entity.ProductStatus;
import com.my.back.entity.Products;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

/** 상품 리포지토리 */
public interface ProductsRepository extends JpaRepository<Products, Long> {

    /**
     * 상태 + 검색어로 상품 조회 (페이지 처리)
     * - status: 상품 상태 (예: ACTIVE)
     * - q: 검색어 (이름 or SKU)
     */
    @Query("""
           SELECT p
           FROM Products p
           WHERE p.status = :status
             AND ( :q IS NULL
                   OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(p.sku)  LIKE LOWER(CONCAT('%', :q, '%')) )
           """)
    Page<Products> searchByStatusAndQuery(@Param("status") ProductStatus status,
                                          @Param("q") String q,
                                          Pageable pageable);
}
