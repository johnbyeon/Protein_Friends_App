// src/main/java/com/my/back/repository/MarketReviewPicRepository.java
package com.my.back.repository;

import com.my.back.entity.MarketReviewPic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MarketReviewPicRepository extends JpaRepository<MarketReviewPic, Long> {

    /** 단일 리뷰의 이미지들 (오름차순) — 유지해도 됨 */
    @Query("""
           SELECT m
           FROM MarketReviewPic m
           WHERE m.pRId = :reviewId
           ORDER BY m.picId ASC
           """)
    List<MarketReviewPic> findAllByReviewIdOrderByPicIdAsc(@Param("reviewId") Long reviewId);

    /** ✅ 여러 리뷰의 이미지를 한 번에 조회(N+1 방지) */
    @Query("""
           SELECT m
           FROM MarketReviewPic m
           WHERE m.pRId IN :reviewIds
           ORDER BY m.pRId ASC, m.picId ASC
           """)
    List<MarketReviewPic> findAllByReviewIdInOrderByPicIdAsc(@Param("reviewIds") List<Long> reviewIds);
}
