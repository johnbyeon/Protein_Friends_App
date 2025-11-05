package com.my.back.repository;

import com.my.back.entity.Faq;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * FAQ Repository
 */
@Repository
public interface FaqRepository extends JpaRepository<Faq, Long> {

    /**
     * 카테고리별 FAQ 조회
     */
    Page<Faq> findByFaqCategory(String category, Pageable pageable);

    /**
     * 검색어로 FAQ 조회 (질문 또는 답변에 포함)
     */
    @Query("SELECT f FROM Faq f WHERE f.faqQuestion LIKE %:keyword% OR f.faqAnswer LIKE %:keyword%")
    Page<Faq> searchFaqs(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 카테고리와 검색어로 FAQ 조회
     */
    @Query("SELECT f FROM Faq f WHERE f.faqCategory = :category AND (f.faqQuestion LIKE %:keyword% OR f.faqAnswer LIKE %:keyword%)")
    Page<Faq> findByCategoryAndKeyword(@Param("category") String category, @Param("keyword") String keyword, Pageable pageable);

    /**
     * 모든 FAQ 조회 (최신순)
     */
    Page<Faq> findAllByOrderByFaqCreateDateDesc(Pageable pageable);

    /**
     * 카테고리 목록 조회
     */
    @Query("SELECT DISTINCT f.faqCategory FROM Faq f ORDER BY f.faqCategory")
    List<String> findDistinctCategories();
}

