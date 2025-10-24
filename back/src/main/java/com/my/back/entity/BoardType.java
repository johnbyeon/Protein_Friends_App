package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 게시글 타입 테이블 (9_2. board_type)
 * - 컬럼명/제약/타입 100% 문서 준수
 * - p_type_id: auto increment PK
 */
@Entity
@Table(name = "board_type")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardType {

    /**
     * 게시글 타입 번호 (PK, auto increment)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "p_type_id", nullable = false)
    private Long pTypeId;

    /**
     * 게시글 타입의 주소 이름 (not null)
     * - 예: "notices", "events", "benefits"
     */
    @Column(name = "p_type_address_name", nullable = false, length = 50)
    private String pTypeAddressName;
    /**
     * 게시글 타입 이름 (not null)
     * - 예: "공지", "이벤트", "혜택"
     */
    @Column(name = "p_type_name", nullable = false, length = 50)
    private String pTypeName;
}
