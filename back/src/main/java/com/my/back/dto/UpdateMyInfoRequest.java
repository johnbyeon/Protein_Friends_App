package com.my.back.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

/**
 * "내 정보 저장" 요청 DTO
 * - Users + UserInfo 필드를 한 번에 받는다.
 * - null 값은 업데이트하지 않음(부분 업데이트)
 */
@Getter @Setter
@JsonIgnoreProperties(ignoreUnknown = true) // 👈 예상 밖 필드는 무시
public class UpdateMyInfoRequest {
    // Users
    private String name;
    private String phone;

    // UserInfo
    private String gender;
    private String address;
    private String birthDay; // yyyy-MM-dd
    private Long gId;
    private String height;
    private String weight;
}
