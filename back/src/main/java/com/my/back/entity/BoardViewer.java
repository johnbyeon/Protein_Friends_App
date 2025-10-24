package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

/**
 * 게시글 뷰어 로그 테이블 (10. board_viewer)
 * - 컬럼명/제약/타입 100% 문서 준수
 * - 복합키: p_id + u_id + date
 * - 한 유저가 같은 게시글 하루에 여러 번 봐도 1회로 카운트 (date는 날짜만)
 */
@Entity
@Table(name = "board_viewer")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(BoardViewerId.class)
public class BoardViewer {

    /**
     * 게시글 번호 (복합키 일부, not null)
     * - board.p_id 참조
     */
    @Id
    @Column(name = "p_id", nullable = false)
    private Long pId;

    /**
     * 유저 아이디 (복합키 일부, not null)
     * - user.u_id 참조
     */
    @Id
    @Column(name = "u_id", nullable = false)
    private Long uId;

    /**
     * 확인 날짜 (복합키 일부, not null)
     * - 날짜만 저장 (시간은 00:00:00)
     */
    @Id
    @CreatedDate
    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    // === 관계 매핑 (LAZY) ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_id", insertable = false, updatable = false)
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", insertable = false, updatable = false)
    private User user;
}