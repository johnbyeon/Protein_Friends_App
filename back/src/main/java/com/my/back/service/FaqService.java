package com.my.back.service;

import com.my.back.dto.FaqRequest;
import com.my.back.dto.FaqResponse;
import com.my.back.entity.Faq;
import com.my.back.repository.FaqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * FAQ Service
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FaqService {

    private final FaqRepository faqRepository;

    /**
     * FAQ 목록 조회 (필터링)
     */
    public Page<FaqResponse> getFaqs(String category, String keyword, Pageable pageable) {
        Page<Faq> faqs;
        
        if (category != null && !category.isEmpty() && keyword != null && !keyword.isEmpty()) {
            // 카테고리 + 검색어
            faqs = faqRepository.findByCategoryAndKeyword(category, keyword, pageable);
        } else if (category != null && !category.isEmpty()) {
            // 카테고리만
            faqs = faqRepository.findByFaqCategory(category, pageable);
        } else if (keyword != null && !keyword.isEmpty()) {
            // 검색어만
            faqs = faqRepository.searchFaqs(keyword, pageable);
        } else {
            // 전체
            faqs = faqRepository.findAllByOrderByFaqCreateDateDesc(pageable);
        }
        
        return faqs.map(this::convertToResponse);
    }

    /**
     * FAQ 상세 조회
     */
    public FaqResponse getFaq(Long faqId) {
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new IllegalArgumentException("FAQ를 찾을 수 없습니다: " + faqId));
        
        return convertToResponse(faq);
    }

    /**
     * FAQ 등록
     */
    @Transactional
    public FaqResponse createFaq(FaqRequest request) {
        Faq faq = Faq.builder()
                .faqTitle(request.getFaqTitle())
                .faqQuestion(request.getFaqQuestion())
                .faqAnswer(request.getFaqAnswer())
                .faqCategory(request.getFaqCategory())
                .build();
        
        faq = faqRepository.save(faq);
        
        return convertToResponse(faq);
    }

    /**
     * FAQ 수정
     */
    @Transactional
    public FaqResponse updateFaq(Long faqId, FaqRequest request) {
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new IllegalArgumentException("FAQ를 찾을 수 없습니다: " + faqId));
        
        faq.setFaqTitle(request.getFaqTitle());
        faq.setFaqQuestion(request.getFaqQuestion());
        faq.setFaqAnswer(request.getFaqAnswer());
        faq.setFaqCategory(request.getFaqCategory());
        
        faq = faqRepository.save(faq);
        
        return convertToResponse(faq);
    }

    /**
     * FAQ 삭제
     */
    @Transactional
    public void deleteFaq(Long faqId) {
        if (!faqRepository.existsById(faqId)) {
            throw new IllegalArgumentException("FAQ를 찾을 수 없습니다: " + faqId);
        }
        
        faqRepository.deleteById(faqId);
    }

    /**
     * 카테고리 목록 조회
     */
    public List<String> getCategories() {
        return faqRepository.findDistinctCategories();
    }

    /**
     * Entity -> DTO 변환
     */
    private FaqResponse convertToResponse(Faq faq) {
        return FaqResponse.builder()
                .faqId(faq.getFaqId())
                .faqTitle(faq.getFaqTitle())
                .faqQuestion(faq.getFaqQuestion())
                .faqAnswer(faq.getFaqAnswer())
                .faqCategory(faq.getFaqCategory())
                .faqCreateDate(faq.getFaqCreateDate())
                .faqUpdateDate(faq.getFaqUpdateDate())
                .build();
    }
}

