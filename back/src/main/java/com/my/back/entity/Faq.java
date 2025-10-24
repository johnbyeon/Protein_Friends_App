package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 24. 자주하는 질문 (faq)
 *
 * FAQ(자주 묻는 질문) 테이블
 */
@Entity
@Table(name = "faq")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Faq {

    /** 질문등록번호 (auto create, not null, primary key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "faq_id", nullable = false)
    private Long faqId;

    /** 질문 제목 (not null, string) */
    @Column(name = "faq_title", nullable = false)
    private String faqTitle;

    /** 질문 (not null, string) */
    @Column(name = "faq_question", nullable = false)
    private String faqQuestion;

    /** 답변 (not null, string) */
    @Column(name = "faq_answer", nullable = false)
    private String faqAnswer;

    /** 작성일 (not null, date time) */
    @Column(name = "faq_create_date", nullable = false)
    private LocalDateTime faqCreateDate;

    /** 수정일 (not null, date time) */
    @Column(name = "faq_update_date", nullable = false)
    private LocalDateTime faqUpdateDate;

    /** 질문 카테고리 (not null, string) */
    @Column(name = "faq_category", nullable = false)
    private String faqCategory;
}
