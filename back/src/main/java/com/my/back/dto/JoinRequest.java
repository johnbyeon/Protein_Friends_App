// 📂 src/main/java/com/my/back/dto/JoinRequest.java
package com.my.back.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor       // ✅ Jackson용 기본 생성자 추가
@AllArgsConstructor      // (선택) 필요하면 전체 생성자도 함께
public class JoinRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;

    @NotBlank
    private String name;

    @NotBlank
    private String phone;
}
