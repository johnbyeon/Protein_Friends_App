package com.my.back.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 29. PT클래스정보 (pt_class_info)
 * <p>
 * PT 클래스의 기본 정보 및 스케줄을 저장하는 테이블
 * <p>
 * 관계:
 * - TrainerInfo (t_id)
 */
@Entity
@Table(name = "pt_class_info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PTClassInfo {

    /** PT클래스 번호 (not null, primary key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pt_class_id", nullable = false)
    @JsonProperty("ptClassId")
    private Long ptClassId;

    /** 클래스 이름 (not null, string) */
    @Column(name = "class_name", nullable = false)
    @JsonProperty("className")
    private String className;

    /** 클래스 내용 (not null, string) */
    @Column(name = "class_content", nullable = false)
    @JsonProperty("classContent")
    private String classContent;

    /** 트레이너 등록번호 (trainer_info 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t_id", nullable = false)
    private TrainerInfo trainer;

    /** 수업시작일시 (not null, date time) */
    @Column(name = "start_datetime", nullable = false)
    @JsonProperty("startDatetime")
    private LocalDateTime startDatetime;

    /** 수업종료일시 (not null, date time) */
    @Column(name = "end_datetime", nullable = false)
    @JsonProperty("endDatetime")
    private LocalDateTime endDatetime;

    /** 최대 정원 (not null, number) */
    @Column(name = "max_capacity", nullable = false)
    @JsonProperty("maxCapacity")
    private Integer maxCapacity;

    /** 차감횟수 (not null, number) */
    @Column(name = "pt_minus_count", nullable = false)
    @JsonProperty("ptMinusCount")
    private Integer ptMinusCount;

    // ✅ 추가: 수업 시작/종료 여부 판단 메서드
    public boolean isStarted() {
        return LocalDateTime.now().isAfter(startDatetime);
    }

    // ✅ 추가: 수업 종료 여부 판단 메서드
    public boolean isEnded() {
        return LocalDateTime.now().isAfter(endDatetime);
    }
}
