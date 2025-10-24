package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 18. 기간제 회원권 기록 (membership_log)
 *
 * 회원이 구매한 기간제 회원권 정보를 저장하는 테이블
 *
 * 관계:
 *  - UserEntity (u_id)
 *  - TrainerInfoEntity (t_id)
 */
@Entity
@Table(name = "membership_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipLog {
    /** 회원증 기록 번호 (auto create, not null, primary key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "m_log_id", nullable = false)
    private Long mLogId;

    /** 회원권 상품번호 (auto create, not null, primary key) */
    @Column(name = "membership_id", nullable = false)
    private Long membershipId;

    /** 회원권 이름 (not null, string) */
    @Column(name = "membership_name", nullable = false)
    private String membershipName;

    /** 유저 아이디 (user 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", nullable = false)
    private Users users;

    /** 트레이너 등록번호 (trainer_info 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t_id", nullable = false)
    private TrainerInfo trainer;

    /** 회원권 시작일 (not null, date) */
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    /** 회원권 종료일 (not null, date) */
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    /** 회원권 활성화 상태 (default true, Enum: 만료,사용중,정지,취소) */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MembershipStatus status;

    /** 판매일(구매일) (not null, date time) */
    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate;

    /** 회원권 정가 (not null, number) */
    @Column(name = "price", nullable = false)
    private Integer price;

    /** 할인 받은 금액 (default 0, not null, number) */
    @Column(name = "sale_price", nullable = false)
    private Integer salePrice = 0;

    /** 정지 가능횟수 (default 0, not null, number) */
    @Column(name = "stop_count", nullable = false)
    private Integer stopCount = 0;

}
