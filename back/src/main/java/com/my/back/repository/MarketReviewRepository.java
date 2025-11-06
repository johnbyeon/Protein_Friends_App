// src/main/java/com/my/back/repository/MarketReviewRepository.java
package com.my.back.repository;

import com.my.back.entity.MarketReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketReviewRepository extends JpaRepository<MarketReview, Long> {

    interface RatingSummary {
        Double getAvg();
        Long   getCnt();
    }

    @Query("""
           SELECT COALESCE(AVG(r.pRating), 0) AS avg,
                  COUNT(r)                   AS cnt
           FROM   MarketReview r
           WHERE  r.pId = :pId
           """)
    RatingSummary summarize(@Param("pId") Long pId);

    // ✅ 전체 리뷰(최신순)
    @Query("""
           SELECT r
           FROM   MarketReview r
           WHERE  r.pId = :pId
           ORDER BY r.pRId DESC
           """)
    Page<MarketReview> findPageByProductId(@Param("pId") Long pId, Pageable pageable);

    // ✅ 내 리뷰만(최신순)
    @Query("""
           SELECT r
           FROM   MarketReview r
           WHERE  r.pId = :pId
             AND  r.uId = :uId
           ORDER BY r.pRId DESC
           """)
    Page<MarketReview> findPageByProductIdAndUserId(@Param("pId") Long pId,
                                                    @Param("uId") Long uId,
                                                    Pageable pageable);
}
