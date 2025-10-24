package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.CreatedDate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pt_info")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PtInfo {

    /**
     * PT 기록번호 (PK, auto increment)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pt_record_id", nullable = false)
    private Long ptRecordId;

    /**
     * PT 아이디 (not null)
     */
    @Column(name = "pt_id", nullable = false)
    private Long ptId;

    /**
     * 유저 아이디 (not null)
     */
    @Column(name = "u_id", nullable = false)
    private Long uId;

    /**
     * 트레이너 아이디 (default 0)
     */
    @Column(name = "t_id")
    private Long tId = 0L;

    /**
     * PT 컬 (default 0)
     */
    @Column(name = "pt_col")
    private Long ptCol = 0L;

    /**
     * PT 이름 (not null)
     */
    @Column(name = "pt_name", nullable = false, length = 100)
    private String ptName;

    /**
     * 시작날짜 (not null)
     */
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    /**
     * 종료날짜 (not null)
     */
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    /**
     * PT 총 횟수 (default 0, not null)
     */
    @Column(name = "pt_total_count", nullable = false)
    private Integer ptTotalCount = 0;

    /**
     * 상태 (default true)
     */
    @Column(name = "status")
    private Boolean status = true;

    /**
     * 가격 (not null)
     */
    @Column(name = "price", nullable = false)
    private BigDecimal price;

    /**
     * 할인가격 (default 0, not null)
     */
    @Column(name = "sale_price", nullable = false)
    private BigDecimal salePrice = BigDecimal.ZERO;

    /**
     * 생성일시 (자동 생성, not null)
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // === 관계 매핑 (LAZY) ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t_id", insertable = false, updatable = false)
    private TrainerInfo trainer;

    // pt_id 관계는 해당 테이블 정의될 때 추가
}