package com.my.back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 답변 등록/수정 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerRequest {
    private String answer;  // 답변 내용
}

