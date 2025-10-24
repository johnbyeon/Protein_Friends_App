package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 21. PT횟수 이용권 종류 (PT_service)
 * <p>
 * PT 이용권 상품 정보를 저장하는 테이블
 */
@Entity
@Table(name = "pt_service")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PTService {

    /** 이용권 id (auto create, not null, primary key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pt_id", nullable = false)
    private Long ptId;

    /** 이용권 사진 url (not null, string) */
    @Column(name = "pt_pic_url", nullable = false)
    private String ptPicUrl;

    /** 이용권 이름 (not null, string) */
    @Column(name = "pt_name", nullable = false)
    private String ptName;

    /** 이용 가능 횟수 (not null, number) */
    @Column(name = "pt_count", nullable = false)
    private Integer ptCount;

    /** 이용 유효 기간 (시작일로부터 몇 일, not null, number) */
    @Column(name = "pt_duration_days", nullable = false)
    private Integer ptDurationDays;

    /** 이용권 가격 (default 0, not null, number) */
    @Column(name = "pt_price", nullable = false)
    private Integer ptPrice = 0;

    /** 이용권 할인금액 (default 0, not null, number) */
    @Column(name = "pt_sale_price", nullable = false)
    private Integer ptSalePrice = 0;

    /** 이용권 판매중 여부 (default true, not null, boolean) */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /** 이용권 생성날짜 (not null, date time) */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /** 이용권 수정날짜 (not null, date time) */
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;
}
