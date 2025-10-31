package com.my.back.service;

import com.my.back.dto.UserDTO;
import com.my.back.entity.Users;
import com.my.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 사용자 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    /**
     * 이메일로 사용자 조회
     * @param email 사용자 이메일
     * @return UserDTO 또는 null
     */
    public UserDTO getUserByEmail(String email) {
        Users user = userRepository.findByEmail(email);
        if (user == null) {
            return null;
        }
        return toDTO(user);
    }

    /**
     * User 엔티티를 UserDTO로 변환
     * @param user User 엔티티
     * @return UserDTO
     */
    private UserDTO toDTO(Users user) {
        return UserDTO.builder()
                .uId(user.getUId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .role(user.getRole())
                .profilePicture(user.getProfilePicture())
                .build();
    }

    /**
     * 이메일로 사용자 존재 여부 확인
     * @param email 사용자 이메일
     * @return 존재하면 true, 없으면 false
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
