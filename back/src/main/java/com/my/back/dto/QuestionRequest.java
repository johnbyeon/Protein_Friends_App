package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 1:1 문의 등록 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionRequest {
    
    /** 질문 제목 */
    @NotBlank(message = "제목은 필수입니다.")
    @JsonProperty("qtitle")
    private String qTitle;
    
    /** 질문 내용 */
    @NotBlank(message = "내용은 필수입니다.")
    @JsonProperty("qcontent")
    private String qContent;
    
    /** 비밀글 여부 (기본: false) */
    @JsonProperty("qissecret")
    private Boolean qIsSecret;
}

