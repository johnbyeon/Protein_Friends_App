package com.my.back.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
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
    @JsonProperty("ptRecordId")
    private Long ptRecordId;

    /**
     * PT 아이디 (not null)
     */
    @Column(name = "pt_id", nullable = false)
    @JsonProperty("ptId")
    private Long ptId;

    /**
     * 유저 아이디 (not null)
     */
    @Column(name = "u_id", nullable = false)
    @JsonProperty("uId")
    private Long uId;

    /**
     * 트레이너 아이디 (default 0)
     */
    @Column(name = "t_id")
    @Builder.Default
    @JsonProperty("tId")
    private Long tId = 0L;

    /**
     * PT 컬 (default 0)
     */
    @Column(name = "pt_col")
    @Builder.Default
    @JsonProperty("ptCol")
    private Long ptCol = 0L;

    /**
     * PT 이름 (not null)
     */
    @Column(name = "pt_name", nullable = false, length = 100)
    @JsonProperty("ptName")
    private String ptName;

    /**
     * 시작날짜 (not null)
     */
    @Column(name = "start_date", nullable = false)
    @JsonProperty("startDate")
    private LocalDate startDate;

    /**
     * 종료날짜 (not null)
     */
    @Column(name = "end_date", nullable = false)
    @JsonProperty("endDate")
    private LocalDate endDate;

    /**
     * PT 총 횟수 (default 0, not null)
     */
    @Column(name = "pt_total_count", nullable = false)
    @Builder.Default
    @JsonProperty("ptTotalCount")
    private Integer ptTotalCount = 0;

    /**
     * 상태 (default true)
     */
    @Column(name = "status")
    @Builder.Default
    @JsonProperty("status")
    private Boolean status = true;

    /**
     * 가격 (not null)
     */
    @Column(name = "price", nullable = false)
    @JsonProperty("price")
    private BigDecimal price;

    /**
     * 할인가격 (default 0, not null)
     */
    @Column(name = "sale_price", nullable = false)
    @Builder.Default
    @JsonProperty("salePrice")
    private BigDecimal salePrice = BigDecimal.ZERO;

    /**
     * 생성일시 (자동 생성, not null)
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    // === 관계 매핑 (LAZY) ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", insertable = false, updatable = false)
    @JsonIgnore
    private Users users;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t_id", insertable = false, updatable = false)
    @JsonIgnore
    private TrainerInfo trainer;

    // ✅ 추가: 남은 PT 횟수 필드
    @Column(name = "remaining_count", nullable = false)
    @Builder.Default
    private Integer remainingCount = 0;
    // pt_id 관계는 해당 테이블 정의될 때 추가

    // ✅ 추가: 잔여 PT 확인
    public boolean hasRemaining() {
        return remainingCount > 0 && status;
    }

    // ✅ 추가: 사용 1회 차감
    public void useOne() {
        if (remainingCount <= 0) throw new IllegalStateException("PT 잔여 횟수 부족");
        remainingCount--;
    }

    // ✅ 추가: 사용 1회 복구
    public void restoreOne() {
        remainingCount++;
    }
}