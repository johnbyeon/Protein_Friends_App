package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 17. PT 사용기록 (pt_used_log)
 *
 * 피티 이용 내역을 기록하는 테이블
 *
 * 관계:
 *  - UserEntity (u_id)
 *  - TrainerInfoEntity (t_id)
 *  - PtClassInfoEntity (pt_class_id)
 */
@Entity
@Table(name = "pt_used_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PtUsedLog {
    /** 사용기록번호 (auto create, not null, primary key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pt_h_id", nullable = false)
    private Long ptHId;

    /** 유저 아이디 (user 테이블 FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", nullable = false)
    private User user;

    /** 트레이너 등록번호 (trainer_info 테이블 FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t_id", nullable = false)
    private TrainerInfo trainer;

    /** 사용일 (not null, date time) */
    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    /** 피티 총 횟수 (not null, number) */
    @Column(name = "total_count", nullable = false)
    private Integer totalCount;

    /** 피티 총 사용 횟수 (not null, number) */
    @Column(name = "used_count", nullable = false)
    private Integer usedCount;

    /** 활성화 상태 (default true, not null, boolean) */
    @Column(name = "status", nullable = false)
    private Boolean status = true;

    /** PT 클래스 번호 (pt_class_info 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pt_class_id", nullable = false)
    private PTClassInfo ptClass;
}
