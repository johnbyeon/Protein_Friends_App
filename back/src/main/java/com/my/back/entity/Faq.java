package com.my.back.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

/**
 * 24. 자주하는 질문 (faq)
 *
 * FAQ(자주 묻는 질문) 테이블
 */
@Entity
@Table(name = "faq")
@EntityListeners(org.springframework.data.jpa.domain.support.AuditingEntityListener.class)
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
    @JsonProperty("faqId")
    private Long faqId;

    /** 질문 제목 (not null, string) */
    @Column(name = "faq_title", nullable = false)
    @JsonProperty("faqTitle")
    private String faqTitle;

    /** 질문 (not null, string) */
    @Column(name = "faq_question", nullable = false)
    @JsonProperty("faqQuestion")
    private String faqQuestion;

    /** 답변 (not null, string) */
    @Column(name = "faq_answer", nullable = false)
    @JsonProperty("faqAnswer")
    private String faqAnswer;

    /** 작성일 (not null, date time) */
    @CreatedDate
    @Column(name = "faq_create_date", nullable = false)
    @JsonProperty("faqCreateDate")
    private LocalDateTime faqCreateDate;

    /** 수정일 (not null, date time) */
    @LastModifiedDate
    @Column(name = "faq_update_date", nullable = false)
    @JsonProperty("faqUpdateDate")
    private LocalDateTime faqUpdateDate;

    /** 질문 카테고리 (not null, string) */
    @Column(name = "faq_category", nullable = false)
    @JsonProperty("faqCategory")
    private String faqCategory;
}
