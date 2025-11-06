package com.my.back.dto;

import lombok.Data;
import java.util.List;

/**
 * 게시글 타입 순서 재배정 요청 DTO
 * - ID는 유지하고 displayOrder만 변경
 */
@Data
public class BoardTypeReorderRequest {
    /**
     * displayOrder 매핑 리스트
     * - 각 항목은 typeId의 displayOrder를 newOrder로 변경
     */
    private List<OrderMapping> orderMappings;

    @Data
    public static class OrderMapping {
        private Long typeId;        // 게시글 타입 ID (불변)
        private Integer newOrder;   // 새로운 표시 순서
    }
}
