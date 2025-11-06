// src/main/java/com/my/back/repository/CartItemRepository.java
package com.my.back.repository;

import com.my.back.entity.CartItem;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 🛒 CartItemRepository
 * ------------------------------------------------------------
 * 장바구니(cart_item) 테이블 전용 JPA 인터페이스
 * - 한 유저의 장바구니 목록 조회, 중복 확인, 삭제, 카운트 기능 담당
 * ------------------------------------------------------------
 */
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    /** ✅ 특정 유저의 장바구니 목록 */
    @Query("select c from CartItem c where c.uId = :uId order by c.createAt asc")
    List<CartItem> findByUIdOrderByCreateAtAsc(@Param("uId") Long uId);

    /** ✅ 유저가 특정 상품을 이미 담았는지 단건 조회 */
    @Query("select c from CartItem c where c.uId = :uId and c.prodId = :prodId")
    Optional<CartItem> findByUIdAndProdId(@Param("uId") Long uId, @Param("prodId") Long prodId);

    /** ✅ 여러 상품 한 번에 삭제 */
    @Modifying
    @Query("delete from CartItem c where c.uId = :uId and c.prodId in :prodIds")
    void deleteByUIdAndProdIdIn(@Param("uId") Long uId, @Param("prodIds") List<Long> prodIds);

    /** ✅ 장바구니 전체 개수 (배지용) */
    @Query("select count(c) from CartItem c where c.uId = :uId")
    long countByUId(@Param("uId") Long uId);

    /** ✅ 선택된 항목 개수 (선택 구매용) — 기존 파생쿼리 → @Query로 교체 */
    @Query("select count(c) from CartItem c where c.uId = :uId and c.selected = true")
    long countByUIdAndSelectedTrue(@Param("uId") Long uId);

    /** ✅ 선택된 항목 정렬 조회 */
    @Query("select c from CartItem c where c.uId = :uId and c.selected = true order by c.createAt asc")
    List<CartItem> findByUIdAndSelectedTrueOrderByCreateAtAsc(@Param("uId") Long uId);

    /** ✅ 선택된 N개 상품 일괄 조회 (가격/이미지 매핑용) */
    @Query("select c from CartItem c where c.uId = :uId and c.prodId in :prodIds")
    List<CartItem> findByUIdAndProdIdIn(@Param("uId") Long uId, @Param("prodIds") List<Long> prodIds);

    /** ✅ 수량 변경 */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update CartItem c set c.quantity = :qty where c.uId = :uId and c.prodId = :prodId")
    int updateQuantity(@Param("uId") Long uId,
                       @Param("prodId") Long prodId,
                       @Param("qty") Integer quantity);

    /** ✅ 선택 토글 */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update CartItem c set c.selected = :sel where c.uId = :uId and c.prodId = :prodId")
    int updateSelected(@Param("uId") Long uId,
                       @Param("prodId") Long prodId,
                       @Param("sel") Boolean selected);

    /** ✅ 쿠폰 적용/해제 */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update CartItem c set c.appliedRecDisId = :recDisId where c.uId = :uId and c.prodId = :prodId")
    int updateAppliedDiscount(@Param("uId") Long uId,
                              @Param("prodId") Long prodId,
                              @Param("recDisId") Long recDisId);

    /** ✅ 결제 후 선택 항목 비우기 */
    @Modifying
    @Query("delete from CartItem c where c.uId = :uId and c.selected = true")
    int deleteSelected(@Param("uId") Long uId);
}
