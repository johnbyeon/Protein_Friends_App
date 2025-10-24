package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 20. 회원권 종류 (membership_service)
 *
 * 헬스장 기간제 회원권 상품 정보 테이블
 */
@Entity
@Table(name = "membership_service")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipService {

    /** 회원권 번호 (auto create, not null, primary key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "membership_id", nullable = false)
    private Long membershipId;

    /** 회원권 이미지 url */
    @Column(name = "membership_pic_url")
    private String membershipPicUrl;

    /** 회원권 이름 (not null, string) */
    @Column(name = "membership_name", nullable = false)
    private String membershipName;

    /** 회원권 기간 (시작일로부터 며칠) (not null, number) */
    @Column(name = "membership_duration_days", nullable = false)
    private Integer membershipDurationDays;

    /** 회원권 가격 (not null, number) */
    @Column(name = "membership_price", nullable = false)
    private Integer membershipPrice;

    /** 회원권 할인금액 (default 0, not null, number) */
    @Column(name = "membership_sale_price", nullable = false)
    private Integer membershipSalePrice = 0;

    /** 판매중 여부 (default true, not null, boolean) */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /** 회원권 만든 날짜 (not null, date time) */
    @Column(name = "create_at", nullable = false)
    private LocalDateTime createAt;

    /** 회원권 수정 날짜 (not null, date time) */
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;
}
