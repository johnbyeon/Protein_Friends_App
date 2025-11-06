package com.my.back.dto;

import lombok.*;
import java.util.List;

/**
 * 인바디 데이터 그룹화 DTO
 * - 날짜별로 인바디 이미지들을 그룹화하여 응답하는 데이터 구조
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InbodyGroupDto {

    private String date;               // "2024년 5월 11일" 형식의 날짜
    private List<InbodyDto> images;   // 해당 날짜의 인바디 이미지 목록
}