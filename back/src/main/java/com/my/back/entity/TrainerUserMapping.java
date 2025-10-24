package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 27. 담당 트레이너 확인 (trainer_user_mapping)
 * <p>
 * 회원과 담당 트레이너 간의 매핑 정보를 저장하는 테이블
 * <p>
 * 관계:
 * - User (u_id)
 * - TrainerInfo (t_id)
 */
@Entity
@Table(name = "trainer_user_mapping")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainerUserMapping {

    /** 기록번호 (auto create, not null, primary key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maping_id", nullable = false)
    private Long mappingId;

    /** 유저아이디 (user 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", nullable = false)
    private User user;

    /** 트레이너등록번호 (trainer_info 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t_id", nullable = false)
    private TrainerInfo trainer;

    /** 등록일 (not null, date time) */
    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    /** 트레이너 배정 종료일 (트레이너 퇴사 또는 회원 변경 요청 시) */
    @Column(name = "expired_date")
    private LocalDateTime expiredDate;

    /** 현재 트레이너가 유효한지 (default true, not null, boolean) */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
