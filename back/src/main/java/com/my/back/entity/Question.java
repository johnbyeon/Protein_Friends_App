package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 25. 1:1 문의 (question)
 *
 * 회원이 등록한 1:1 문의 내역을 저장하는 테이블
 *
 * 관계:
 *  - User (u_id)
 */
@Entity
@Table(name = "question")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    /** 질문 등록 번호 (auto create, not null, primary key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "q_id", nullable = false)
    private Long qId;

    /** 유저 아이디 (user 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", nullable = false)
    private User user;

    /** 질문 제목 (not null, string) */
    @Column(name = "q_title", nullable = false)
    private String qTitle;

    /** 질문 내용 (not null, string) */
    @Column(name = "q_content", nullable = false)
    private String qContent;

    /** 비밀글 설정 (default false, boolean) */
    @Column(name = "q_is_secret", nullable = false)
    private Boolean qIsSecret = false;

    /** 작성일 (not null, date time) */
    @Column(name = "q_create_date", nullable = false)
    private LocalDateTime qCreateDate;

    /** 수정일 (not null, date time) */
    @Column(name = "q_update_date", nullable = false)
    private LocalDateTime qUpdateDate;
}
