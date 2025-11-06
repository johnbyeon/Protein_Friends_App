package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 비밀번호 변경 요청 DTO
 */
@Data
public class PasswordChangeRequest {
    @JsonProperty("currentPassword")
    private String currentPassword;
    
    @JsonProperty("newPassword")
    private String newPassword;
}

