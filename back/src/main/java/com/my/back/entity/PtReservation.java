package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Table(name = "pt_reservation")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PtReservation {

    /**
     * 예약번호 (PK, auto increment)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_number", nullable = false)
    private Long reservationNumber;

    /**
     * 트레이너 아이디 (not null)
     * - trainer_info.t_id 참조
     */
    @Column(name = "t_id", nullable = false)
    private Long tId;

    /**
     * 유저 아이디 (not null)
     * - user.u_id 참조
     */
    @Column(name = "u_id", nullable = false)
    private Long uId;

    /**
     * 시작시간 (not null)
     */
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    /**
     * 종료시간 (not null)
     */
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    /**
     * PT 횟수 (not null)
     */
    @Column(name = "pt_count", nullable = false)
    private Integer ptCount;

    /**
     * 참여여부 (not null)
     */
    @Column(name = "is_participate_in", nullable = false)
    private Boolean isParticipateIn;

    /**
     * 예약 생성일시 (자동 생성, not null)
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // === 관계 매핑 (LAZY) ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t_id", insertable = false, updatable = false)
    private TrainerInfo trainer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", insertable = false, updatable = false)
    private Users users;
}