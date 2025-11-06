package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 사용자 상세 정보 조회 응답 DTO
 * - Users + UserInfo 통합
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserInfoResponse {
    // Users 테이블 필드
    @JsonProperty("uId")
    private Long uId;
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("phone")
    private String phone;
    
    @JsonProperty("password")
    private String password;
    
    @JsonProperty("role")
    private String role;
    
    @JsonProperty("profilePicture")
    private String profilePicture;
    
    @JsonProperty("googleLinked")
    private boolean googleLinked;
    
    @JsonProperty("naverLinked")
    private boolean naverLinked;
    
    @JsonProperty("kakaoLinked")
    private boolean kakaoLinked;
    
    @JsonProperty("createAt")
    private LocalDateTime createAt;
    
    @JsonProperty("updateAt")
    private LocalDateTime updateAt;

    // UserInfo 테이블 필드
    @JsonProperty("gender")
    private String gender;
    
    @JsonProperty("address")
    private String address;
    
    @JsonProperty("birthDay")
    private LocalDate birthDay;
    
    @JsonProperty("gId")
    private Long gId;              // 소속 지점 ID
    
    @JsonProperty("gymName")
    private String gymName;        // 소속 지점 이름 (조인)
    
    @JsonProperty("height")
    private String height;
    
    @JsonProperty("weight")
    private String weight;
}

