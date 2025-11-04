package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

/**
 * 사용자 정보 수정 요청 DTO
 * - Users + UserInfo 통합 수정
 */
@Data
public class UserInfoUpdateRequest {
    // Users 테이블
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("phone")
    private String phone;
    
    @JsonProperty("profilePicture")
    private String profilePicture;

    // UserInfo 테이블
    @JsonProperty("gender")
    private String gender;
    
    @JsonProperty("address")
    private String address;
    
    @JsonProperty("birthDay")
    private LocalDate birthDay;
    
    @JsonProperty("gId")
    private Long gId;
    
    @JsonProperty("height")
    private String height;
    
    @JsonProperty("weight")
    private String weight;
}

