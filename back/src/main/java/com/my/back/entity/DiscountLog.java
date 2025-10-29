package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 23. 유저별 보유 할인권 보기 (discount_log)
 *
 * 회원이 발급받은 할인권 내역을 저장하는 테이블
 *
 * 관계:
 *  - User (u_id)
 *  - DiscountService (dis_id)
 */
@Entity
@Table(name = "discount_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountLog {

    /** 할인권 발급번호 (auto create, not null, number) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rec_dis_id", nullable = false)
    private Long recDisId;

    /** 유저 아이디 (user 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", nullable = false)
    private Users users;

    /** 할인 쿠폰 id (discount_service 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dis_id", nullable = false)
    private DiscountService discountService;

    /** 사용여부 (not null, boolean) */
    @Column(name = "is_used", nullable = false)
    private Boolean isUsed;

    /** 사용날짜 (not null, date time) */
    @Column(name = "used_date", nullable = false)
    private LocalDateTime usedDate;

    /** 발급날짜 (not null, date time) */
    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate;
}
