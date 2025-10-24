package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 22. 할인권 종류 (discount_service)
 *
 * 할인 쿠폰(PT, 상품, 이용권 등)에 대한 기본 정보를 저장하는 테이블
 */
@Entity
@Table(name = "discount_service")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountService {

    /** 할인 쿠폰 id (auto create, not null, primary key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dis_id", nullable = false)
    private Long disId;

    /** 할인권 이름 (not null, string) */
    @Column(name = "dis_name", nullable = false)
    private String disName;

    /** 할인권 사진 url */
    @Column(name = "dis_pic_url")
    private String disPicUrl;

    /** 할인해줄 가격 (default 0, not null, number) */
    @Column(name = "dis_price", nullable = false)
    private Integer disPrice = 0;

    /** 할인 퍼센트 (default 0, not null, number) */
    @Column(name = "dis_percent", nullable = false)
    private Integer disPercent = 0;

    /** 할인권 시작기간 (date time) */
    @Column(name = "dis_start_date")
    private LocalDateTime disStartDate;

    /** 할인권 종료기간 (date time) */
    @Column(name = "dis_end_date")
    private LocalDateTime disEndDate;

    /** 할인 타입 (enum: PT 할인, 상품할인, 이용권 할인) */
    @Enumerated(EnumType.STRING)
    @Column(name = "dis_type", nullable = false)
    private DiscountType disType;

    /** 적용금액 (얼마부터 적용할지, default 0, not null, number) */
    @Column(name = "dis_threshold_amount", nullable = false)
    private Integer disThresholdAmount = 0;

    /** 할인권 배포여부 (default true, boolean) */
    @Column(name = "is_active")
    private Boolean isActive = true;

    /** 할인권 생성일 (not null, date time) */
    @Column(name = "dis_create_at", nullable = false)
    private LocalDateTime disCreateAt;

    /** 할인권 수정일 (not null, date time) */
    @Column(name = "dis_update_at", nullable = false)
    private LocalDateTime disUpdateAt;
}
