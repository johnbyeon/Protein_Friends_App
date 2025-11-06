package com.my.back.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 인바디 데이터 그룹 DTO
 * - 날짜별로 그룹화된 인바디 이미지 목록을 위한 데이터 구조
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InbodyDto {

    private Long inbodyRecordId;      // 인바디 등록번호
    private String inbodyPicUrl;       // 인바디 사진 URL
    private LocalDateTime createDate;  // 사진등록일

    // 프론트엔드 표시용 포맷된 필드
    private String formattedDate;      // "2024년 5월 11일" 형식의 날짜 문자열
}