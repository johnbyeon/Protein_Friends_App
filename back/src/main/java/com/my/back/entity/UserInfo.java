package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 회원정보 상세 테이블 (1_2. user_info)
 * - u_id: user.u_id와 공유 PK (1:1 관계)
 * - 모든 컬럼 nullable 허용 (문서 기준)
 */
@Entity
@Table(name = "user_info")  // DB 테이블명 명시 (필수)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserInfo {

    /**
     * 회원 고유번호 (PK, user.u_id와 동일)
     * - @MapsId로 User와 공유
     */
    @Id
    @Column(name = "u_id")
    private Long uId;

    /**
     * 1:1 관계 설정
     * - u_id를 user.u_id와 매핑
     */
    @OneToOne
    @MapsId  // uId = user.uId 자동 설정
    @JoinColumn(name = "u_id")
    private User user;

    /** 성별 (nullable, ex: "남자", "여자", "기타") */
    private String gender;

    /** 주소 (nullable, ex: "서울시 강남구...") */
    private String address;

    /** 생년월일 (nullable, ex: 1990-01-01) */
    @Column(name = "birth_day")
    private LocalDate birthDay;

    /** 소속 지점 번호 (nullable, gym_info.g_id 참조) */
    private Long gId;

    /** 키 (nullable, ex: "175cm") */
    private String height;

    /** 몸무게 (nullable, ex: "70kg") */
    private String weight;

    /** 기록 생성일시 (not null, 자동 생성) */
    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;

    /** 마지막 수정일시 (not null, 자동 갱신) */
    @UpdateTimestamp
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;
}
