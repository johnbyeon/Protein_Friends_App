package com.my.back.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

/**
 * 19. 회원별 상담메모 (consultation)
 *
 * 회원의 상담 내역을 기록하는 테이블
 *
 * 관계:
 *  - UserEntity (u_id)
 *  - TrainerInfoEntity (t_id)
 */
@Entity
@Table(name = "consultation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation {
    /** 상담 번호 (auto create, not null, number) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "c_id", nullable = false)
    @JsonProperty("cId")
    private Long cId;

    /** 회원이면 true(미등록회원은 false) (default false, boolean) */
    @Column(name = "is_member", nullable = false)
    @Builder.Default
    @JsonProperty("isMember")
    private Boolean isMember = false;

    /** 유저아이디 (user 테이블 FK, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id")
    private Users users;

    /** 트레이너 등록번호 (trainer_info 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t_id", nullable = false)
    private TrainerInfo trainer;

    /** 상담제목 (not null, string) */
    @Column(name = "subtitle", nullable = false)
    @JsonProperty("subtitle")
    private String subtitle;

    /** 상담노트기록 (not null, string) */
    @Column(name = "note", nullable = false)
    @JsonProperty("note")
    private String note;

    /** 상담노트 등록시간 (not null, date time) */
    @CreatedDate
    @Column(name = "c_date", nullable = false)
    @JsonProperty("cDate")
    private LocalDateTime cDate;

    /** 조치내용 (string) */
    @Column(name = "next_action")
    @JsonProperty("nextAction")
    private String nextAction;

    /** 상담진행상태 (enum: 상담완료, 상담중) */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @JsonProperty("status")
    private ConsultationStatus status;
}
