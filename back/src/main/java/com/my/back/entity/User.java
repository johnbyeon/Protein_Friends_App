package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 회원정보 테이블 (1_1. user)
 * - u_id: 숫자 auto increment PK
 * - email: 로그인용 아이디 (unique)
 * - user_role: ADMIN, TRAINER, USER
 */
@Entity
@Table(name = "user")  // DB 테이블명 명시 (필수)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    /** 회원 고유번호 (PK, auto increment) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "u_id")
    private Long uId;

    /** 이메일 (로그인 ID, unique, not null) */
    @Column(nullable = false, unique = true)
    private String email;

    /** 비밀번호 (not null, 암호화 저장) */
    @Column(nullable = false)
    private String password;

    /** 회원 이름 (nullable) */
    private String name;

    /** 휴대전화번호 (nullable, ex: 010-1234-5678) */
    private String phone;

    /**
     * 소셜 연결 코드 (nullable)
     * - google: "g001", "g002"...
     * - naver: "n001", "n002"...
     * - kakao: "k001", "k002"...
     * - null = 미연결
     */
    private String google;
    private String naver;
    private String kakao;

    /** 회원 역할 (not null, enum) */
    @Enumerated(EnumType.STRING)
    @Column(name = "user_role", nullable = false)
    private UserRole userRole;

    /** 가입일시 (not null, 자동 생성) */
    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;

    /** 마지막 로그인/수정일시 (not null, 자동 갱신) */
    @UpdateTimestamp
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;

    /** 프로필 사진 URL (nullable, ex: https://...) */
    @Column(name = "profile_picture")
    private String profilePicture;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserInfo userInfo;

    /** 소셜 연결 상세 정보 (1:N, 단방향) */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SocialAccount> socialAccounts = new ArrayList<>();
}