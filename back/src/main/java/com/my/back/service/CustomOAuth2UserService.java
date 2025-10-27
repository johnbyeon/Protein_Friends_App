package com.my.back.service;

import com.my.back.dto.CustomOAuth2User;
import com.my.back.entity.SocialAccount;
import com.my.back.entity.UserRole;
import com.my.back.entity.Users;
import com.my.back.oauth2.OAuth2UserInfo;
import com.my.back.oauth2.OAuth2UserInfoFactory;
import com.my.back.repository.SocialAccountRepository;
import com.my.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId().toLowerCase();
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        String email = userInfo.getEmail();
        String providerUserId = userInfo.getId();

        // ✅ 유저 조회 or 신규 생성
        Users user = userRepository.findByEmail(email);
        if (user == null) {
            user = userRepository.save(Users.builder()
                    .email(email)
                    .password("SOCIAL_" + registrationId.toUpperCase())
                    .userRole(UserRole.USER)
                    .build());
        }

        // ✅ 소셜 계정 연결 여부 업데이트
        switch (registrationId) {
            case "google" -> user.setGoogleLinked(true);
            case "kakao" -> user.setKakaoLinked(true);
            case "naver" -> user.setNaverLinked(true);
        }

        userRepository.save(user); // ✅ 연결 상태 저장

        // ✅ SocialAccount 업데이트 or 신규 생성
        SocialAccount account = socialAccountRepository
                .findByProviderAndProviderUserId(registrationId.toUpperCase(), providerUserId)
                .orElse(null);

        if (account == null) {
            account = SocialAccount.builder()
                    .users(user)
                    .provider(registrationId.toUpperCase())
                    .providerUserId(providerUserId)
                    .build();
        }


// ✅ Instant → LocalDateTime 변환
        Instant expiresAtInstant = userRequest.getAccessToken().getExpiresAt();
        LocalDateTime expiresAt = null;
        if (expiresAtInstant != null) {
            expiresAt = LocalDateTime.ofInstant(expiresAtInstant, ZoneId.systemDefault());
        }

        account.setAccessToken(userRequest.getAccessToken().getTokenValue());
        account.setTokenExpiresAt(expiresAt);
        account.setConnectedAt(LocalDateTime.now());

        socialAccountRepository.save(account);

        return new CustomOAuth2User(
                user.getEmail(),
                user.getUserRole().getLabel(),
                oAuth2User.getAttributes(),
                oAuth2User.getAuthorities()
        );
    }
}
