package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;


import java.time.LocalDateTime;

/**
 * 출입관리 로그 테이블 (2. access_log)
 * - 출입 순서별 기록
 * - 입장/퇴장 상태 + 시간 자동 기록
 */
@Entity
@Table(name = "access_log")  // DB 테이블명 명시 (필수)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccessLog {

    /**
     * 출입 로그 고유번호 (PK, auto increment)
     * - 등록 순서대로 증가
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "a_id")
    private Long aId;

    /**
     * 지점 번호 (not null, gym_info.g_id 참조)
     * - 외래키로 gym_info 테이블 연결
     */
    @Column(name = "g_id", nullable = false)
    private Long gId;

    /**
     * 출입한 회원 번호 (not null, user.u_id 참조)
     * - 외래키로 user 테이블 연결
     */
    @Column(name = "u_id", nullable = false)
    private Long uId;

    /**
     * 출입 방향 (not null)
     * - "입장" or "퇴장"
     * - enum으로 관리: IN, OUT
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "access_direction", nullable = false)
    private AccessDirection accessDirection;

    /**
     * 출입 등록 시간 (not null, 자동 생성)
     * - 입장/퇴장 시점
     */
    @CreatedDate
    @Column(name = "access_time", nullable = false, updatable = false)
    private LocalDateTime accessTime;

    // === 관계 매핑 (선택적, 성능 고려) ===
    /** 회원 정보 (N:1) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", insertable = false, updatable = false)
    private Users users;

    /** 지점 정보 (N:1) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "g_id", insertable = false, updatable = false)
    private GymInfo gymInfo;
}