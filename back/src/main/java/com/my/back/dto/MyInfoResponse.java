package com.my.back.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * "내 정보 보기" 응답 DTO
 * - Users 기본정보 + UserInfo 확장정보 + 소셜 제공자 + (선택) 지점명 포함
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class MyInfoResponse {

    // ---------- Users 기본 ----------
    private Long uId;           // PK
    private String email;       // 로그인 이메일
    private String role;        // USER / ADMIN ...
    private String name;        // 이름
    private String phone;       // 전화번호

    // ---------- UserInfo 확장 ----------
    private String gender;      // "남자/여자/기타"
    private String address;     // 주소
    private String birthDay;    // yyyy-MM-dd (문자열 형태로 반환)
    private Long gId;           // 소속 지점 ID
    private String gymName;     // 소속 지점명 (선택)
    private String height;      // 키 (예: "175" 또는 "175cm")
    private String weight;      // 몸무게 (예: "70"  또는 "70kg")
    private LocalDateTime infoCreatedAt; // user_info.create_at
    private LocalDateTime infoUpdatedAt; // user_info.update_at

    // ---------- 소셜 ----------
    private List<String> socialProviders; // ["GOOGLE","NAVER","KAKAO"...]
}
