package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * FAQ 등록/수정 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaqRequest {
    
    /** 질문 제목 */
    @JsonProperty("faqtitle")
    private String faqTitle;
    
    /** 질문 */
    @NotBlank(message = "질문은 필수입니다.")
    @JsonProperty("faqquestion")
    private String faqQuestion;
    
    /** 답변 */
    @NotBlank(message = "답변은 필수입니다.")
    @JsonProperty("faqanswer")
    private String faqAnswer;
    
    /** 카테고리 */
    @NotBlank(message = "카테고리는 필수입니다.")
    @JsonProperty("faqcategory")
    private String faqCategory;
}

