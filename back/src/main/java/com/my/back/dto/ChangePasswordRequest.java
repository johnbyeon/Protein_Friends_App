package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

/**
 * 비밀번호 변경 요청 DTO (로컬 계정 전용)
 */
@Getter @Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChangePasswordRequest {
    private String currentPassword; // 현재 비밀번호
    private String oldPassword;
    private String newPassword;     // 새 비밀번호

    public String effectiveCurrent() {
        return (currentPassword != null && !currentPassword.isBlank()) ? currentPassword : oldPassword;
    }
}
