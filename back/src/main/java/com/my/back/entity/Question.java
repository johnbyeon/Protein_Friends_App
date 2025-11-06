package com.my.back.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

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
@EntityListeners(org.springframework.data.jpa.domain.support.AuditingEntityListener.class)
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
    @JsonProperty("qId")
    private Long qId;

    /** 유저 아이디 (user 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", nullable = false)
    private Users users;

    /** 질문 제목 (not null, string) */
    @Column(name = "q_title", nullable = false)
    @JsonProperty("qTitle")
    private String qTitle;

    /** 질문 내용 (not null, string) */
    @Column(name = "q_content", nullable = false)
    @JsonProperty("qContent")
    private String qContent;

    /** 비밀글 설정 (default false, boolean) */
    @Column(name = "q_is_secret", nullable = false)
    @Builder.Default
    @JsonProperty("qIsSecret")
    private Boolean qIsSecret = false;

    /** 작성일 (not null, date time) */
    @CreatedDate
    @Column(name = "q_create_date", nullable = false)
    @JsonProperty("qCreateDate")
    private LocalDateTime qCreateDate;

    /** 수정일 (not null, date time) */
    @LastModifiedDate
    @Column(name = "q_update_date", nullable = false)
    @JsonProperty("qUpdateDate")
    private LocalDateTime qUpdateDate;
}
