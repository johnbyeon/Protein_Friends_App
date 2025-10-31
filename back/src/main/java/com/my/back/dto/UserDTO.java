package com.my.back.dto;

import com.my.back.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User 엔티티를 클라이언트에 노출하기 위한 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    /** 사용자 고유번호 */
    private Long uId;

    /** 이메일 */
    private String email;

    /** 이름 */
    private String name;

    /** 전화번호 */
    private String phone;

    /** 역할 (USER, TRAINER, ADMIN) */
    private UserRole role;

    /** 프로필 사진 URL */
    private String profilePicture;
}
