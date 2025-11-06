package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * FAQ 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaqResponse {
    
    @JsonProperty("faqid")
    private Long faqId;
    
    @JsonProperty("faqtitle")
    private String faqTitle;
    
    @JsonProperty("faqquestion")
    private String faqQuestion;
    
    @JsonProperty("faqanswer")
    private String faqAnswer;
    
    @JsonProperty("faqcategory")
    private String faqCategory;
    
    @JsonProperty("faqcreatedate")
    private LocalDateTime faqCreateDate;
    
    @JsonProperty("faqupdatedate")
    private LocalDateTime faqUpdateDate;
}

