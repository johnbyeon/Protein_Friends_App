package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 사용자 기본 정보 응답 DTO (순환 참조 방지)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBasicResponse {
    @JsonProperty("uId")
    private Long uId;
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("phone")
    private String phone;
    
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
}

