package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 18_2. 기간제 회원권 정지기록 (membership_stop_log)
 *
 * 회원권 정지 내역을 기록하는 테이블
 *
 * 관계:
 *  - MembershipLogEntity (m_log_id)
 */
@Entity
@Table(name = "membership_stop_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipStopLog {
    /** 회원권 정지번호 (auto create, not null, primary key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stop_log_id", nullable = false)
    private Long stopLogId;

    /** 회원증 기록 번호 (membership_log 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "m_log_id", nullable = false)
    private MembershipLog membershipLog;

    /** 회원권 상품번호 (not null, number) */
    @Column(name = "membership_id", nullable = false)
    private Long membershipId;

    /** 회원권 시작일 (not null, date) */
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    /** 회원권 정지 전 종료일 (not null, date) */
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    /** 회원권 정지일 (not null, date time) */
    @Column(name = "stop_date", nullable = false)
    private LocalDateTime stopDate;

    /** 정지로 연장되는 기간 (not null, number) */
    @Column(name = "plus_date", nullable = false)
    private Integer plusDate;

    /** 정지사유 (default 0, not null, number) */
    @Column(name = "reason_note", nullable = false)
    private Integer reasonNote = 0;
}
