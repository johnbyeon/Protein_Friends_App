package com.my.back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 1:1 문의 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    
    private Long qid;              // 질문 ID
    private Long uid;              // 유저 ID
    private String username;       // 유저 이름
    private String useremail;      // 유저 이메일
    private String qtitle;         // 질문 제목
    private String qcontent;       // 질문 내용
    private Boolean qissecret;     // 비밀글 여부
    private LocalDateTime qcreatedate;  // 작성일
    private LocalDateTime qupdatedate;  // 수정일
    
    // 답변 정보 (있는 경우만)
    private AnswerInfo answer;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerInfo {
        private Long answerid;          // 답변 ID
        private Long tid;               // 트레이너 ID
        private String trainername;     // 트레이너 이름
        private String answer;          // 답변 내용
        private LocalDateTime createdate;   // 답변 작성일
        private LocalDateTime updatedate;   // 답변 수정일
        private LocalDateTime readdate;     // 답변 확인일
    }
}

