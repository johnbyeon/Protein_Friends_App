package com.my.back.service;

import com.my.back.dto.UserDTO;
import com.my.back.dto.UserInfoResponse;
import com.my.back.dto.UserInfoUpdateRequest;
import com.my.back.entity.GymInfo;
import com.my.back.entity.UserInfo;
import com.my.back.entity.Users;
import com.my.back.repository.GymInfoRepository;
import com.my.back.repository.UserInfoRepository;
import com.my.back.repository.UserRepository;
import com.my.back.repository.TrainerInfoRepository;
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
    private final UserInfoRepository userInfoRepository;
    private final GymInfoRepository gymInfoRepository;
    private final TrainerInfoRepository trainerInfoRepository;

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

    /**
     * 유저 검색 (이름 또는 이메일로 검색)
     * - 이미 트레이너로 등록된 유저는 제외
     * @param query 검색어
     * @return 검색된 유저 DTO 리스트 (트레이너 제외)
     */
    public java.util.List<UserDTO> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }

        java.util.List<Users> users = userRepository.searchByNameOrEmail(query.trim());

        // ✅ 이미 트레이너로 등록된 유저는 제외
        return users.stream()
                .filter(user -> !trainerInfoRepository.existsByuId(user.getUId()))
                .map(this::toDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 사용자 ID로 상세 정보 조회 (Users + UserInfo 통합)
     * @param uId 사용자 ID
     * @return UserInfoResponse
     */
    public UserInfoResponse getUserDetailInfo(Long uId) {
        Users user = userRepository.findById(uId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + uId));

        UserInfo userInfo = userInfoRepository.findById(uId).orElse(null);
        String gymName = null;
        if (userInfo != null && userInfo.getGId() != null) {
            GymInfo gym = gymInfoRepository.findById(userInfo.getGId()).orElse(null);
            if (gym != null) {
                gymName = gym.getGName();
            }
        }

        return UserInfoResponse.builder()
                .uId(user.getUId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .password(user.getPassword())  // 소셜 로그인 확인용 (SOCIAL_GOOGLE 등)
                .role(user.getRole().name())
                .profilePicture(user.getProfilePicture())
                .googleLinked(user.isGoogleLinked())
                .naverLinked(user.isNaverLinked())
                .kakaoLinked(user.isKakaoLinked())
                .createAt(user.getCreateAt())
                .updateAt(user.getUpdateAt())
                .gender(userInfo != null ? userInfo.getGender() : null)
                .address(userInfo != null ? userInfo.getAddress() : null)
                .birthDay(userInfo != null ? userInfo.getBirthDay() : null)
                .gId(userInfo != null ? userInfo.getGId() : null)
                .gymName(gymName)
                .height(userInfo != null ? userInfo.getHeight() : null)
                .weight(userInfo != null ? userInfo.getWeight() : null)
                .build();
    }

    /**
     * 사용자 정보 수정 (Users + UserInfo 통합)
     * @param uId 사용자 ID
     * @param request 수정 요청 DTO
     * @return 수정된 UserInfoResponse
     */
    @Transactional
    public UserInfoResponse updateUserInfo(Long uId, UserInfoUpdateRequest request) {
        Users user = userRepository.findById(uId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + uId));

        // Users 테이블 업데이트
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }
        userRepository.save(user);

        // UserInfo 테이블 업데이트
        UserInfo userInfo = userInfoRepository.findById(uId).orElse(null);
        if (userInfo == null) {
            // UserInfo가 없으면 새로 생성
            // ⚠️ @MapsId 사용 시 uId는 자동 설정되므로 명시하지 않음
            userInfo = UserInfo.builder()
                    .users(user)  // users만 설정하면 uId는 자동으로 user.uId로 설정됨
                    .gender(request.getGender())
                    .address(request.getAddress())
                    .birthDay(request.getBirthDay())
                    .gId(request.getGId())
                    .height(request.getHeight())
                    .weight(request.getWeight())
                    .build();
        } else {
            // 기존 UserInfo 업데이트
            if (request.getGender() != null) {
                userInfo.setGender(request.getGender());
            }
            if (request.getAddress() != null) {
                userInfo.setAddress(request.getAddress());
            }
            if (request.getBirthDay() != null) {
                userInfo.setBirthDay(request.getBirthDay());
            }
            if (request.getGId() != null) {
                userInfo.setGId(request.getGId());
            }
            if (request.getHeight() != null) {
                userInfo.setHeight(request.getHeight());
            }
            if (request.getWeight() != null) {
                userInfo.setWeight(request.getWeight());
            }
        }
        userInfoRepository.save(userInfo);

        return getUserDetailInfo(uId);
    }
}
