package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 30. 클래스 신청인원정보 (class_user_info)
 *
 * PT 클래스에 신청한 회원 정보를 저장하는 테이블
 *
 * 관계:
 *  - PTClassInfo (pt_class_id)
 *  - User (u_id)
 */
@Entity
@Table(name = "class_user_info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassUserInfo {

    /** PT클래스 번호 (pt_class_info 테이블 FK, not null, number) */
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pt_class_id", nullable = false)
    private PTClassInfo ptClassInfo;

    /** 유저 id (user 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", nullable = false)
    private Users users;

    /** 신청 날짜 (not null, date time) */
    @Column(name = "datetime", nullable = false)
    private LocalDateTime datetime;
}
