package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 28. 인바디 데이터 URL (inbody_url)
 *
 * 회원의 인바디 측정 데이터를 사진 형태로 저장하는 테이블
 *
 * 관계:
 *  - TrainerInfo (t_id)
 *  - User (u_id)
 */
@Entity
@Table(name = "inbody_url")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InbodyUrl {

    /** 인바디 등록번호 (auto create, not null, primary key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inbody_record_id", nullable = false)
    private Long inbodyRecordId;

    /** 트레이너 등록번호 (trainer_info 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t_id", nullable = false)
    private TrainerInfo trainer;

    /** 유저아이디 (user 테이블 FK, not null, number) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", nullable = false)
    private User user;

    /** 인바디 사진 URL (not null, string) */
    @Column(name = "inbody_pic_url", nullable = false)
    private String inbodyPicUrl;

    /** 사진등록일 (not null, date time) */
    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate;

    /** 사진수정일 (not null, date time) */
    @Column(name = "update_date", nullable = false)
    private LocalDateTime updateDate;
}
