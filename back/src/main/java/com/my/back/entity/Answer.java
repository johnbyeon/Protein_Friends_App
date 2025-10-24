package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 26. 1:1 문의 답변 (answer)
 *
 * 트레이너 또는 관리자가 1:1 문의에 대해 남긴 답변 테이블
 *
 * 관계:
 *  - Question (q_id)
 *  - TrainerInfo (t_id)
 */
@Entity
@Table(name = "answer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Answer {

    /** 답변번호 (auto create, not null, primary key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id", nullable = false)
    private Long answerId;

    /** 질문등록번호 (question 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "q_id", nullable = false)
    private Question question;

    /** 트레이너 등록번호 (trainer_info 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t_id", nullable = false)
    private TrainerInfo trainer;

    /** 답변글 (not null, string) */
    @Column(name = "answer", nullable = false)
    private String answer;

    /** 답변 작성일 (not null, date time) */
    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate;

    /** 답변 수정일 (not null, date time) */
    @Column(name = "update_date", nullable = false)
    private LocalDateTime updateDate;

    /** 답변 확인 날짜 (date time) */
    @Column(name = "read_date")
    private LocalDateTime readDate;
}
