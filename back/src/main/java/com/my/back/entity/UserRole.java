package com.my.back.entity;

import lombok.Getter;

/** 회원 역할 */
@Getter

public enum UserRole {
    ADMIN("ROLE_ADMIN"),   // 관리자
    TRAINER("ROLE_TRAINER"), // 트레이너
    USER("ROLE_USER"); // 일반 회원

    private final String label;

    UserRole(String label) {
        this.label = label;
    }


    // Optional: toString() 오버라이드
    @Override
    public String toString() {
        return label;
    }

}
