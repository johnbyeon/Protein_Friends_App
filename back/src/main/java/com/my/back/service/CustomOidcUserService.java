package com.my.back.service;

import com.my.back.entity.SocialAccount;
import com.my.back.entity.UserRole;
import com.my.back.entity.Users;
import com.my.back.oauth2.OAuth2UserInfo;
import com.my.back.oauth2.OAuth2UserInfoFactory;
import com.my.back.repository.SocialAccountRepository;
import com.my.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) {
        // 1) OIDC 유저 로딩
        OidcUser oidcUser = super.loadUser(userRequest);

        // 2) 공통 저장 로직 처리
        String registrationId = userRequest.getClientRegistration().getRegistrationId().toLowerCase();
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, oidcUser.getAttributes());

        String email = userInfo.getEmail();        // 구글: email, 동의 안 하면 null 가능
        String providerUserId = userInfo.getId();  // 구글: sub (반드시 존재)

        log.info("[OIDC] provider={}, providerUserId={}, email={}", registrationId, providerUserId, email);
        if (providerUserId == null || providerUserId.isBlank()) {
            throw new IllegalStateException("OIDC provider user id is null/blank");
        }

        // 이메일이 없을 수도 있으므로 유연하게 저장
        Users user = null;
        if (email != null && !email.isBlank()) {
            user = userRepository.findByEmail(email);
        }
        if (user == null) {
            user = Users.builder()
                    .email(email) // null 허용 or 제약 확인 필요
                    .password("SOCIAL_" + registrationId.toUpperCase())
                    .role(UserRole.USER)
                    .build();
            user = userRepository.save(user);
            log.info("[OIDC] created Users row id={}, email={}", user.getUId(), user.getEmail());
        }

        switch (registrationId) {
            case "google" -> user.setGoogleLinked(true);
            case "kakao"  -> user.setKakaoLinked(true);
            case "naver"  -> user.setNaverLinked(true);
        }
        userRepository.save(user);

        SocialAccount account = socialAccountRepository
                .findByProviderAndProviderUserId(registrationId.toUpperCase(), providerUserId)
                .orElse(SocialAccount.builder()
                        .users(user)
                        .provider(registrationId.toUpperCase())
                        .providerUserId(providerUserId)
                        .build());

        Instant exp = userRequest.getAccessToken().getExpiresAt();
        LocalDateTime expiresAt = (exp != null) ? LocalDateTime.ofInstant(exp, ZoneId.systemDefault()) : null;

        account.setAccessToken(userRequest.getAccessToken().getTokenValue());
        account.setTokenExpiresAt(expiresAt);
        account.setConnectedAt(LocalDateTime.now());
        socialAccountRepository.save(account);

        // 3) 반환은 OIDC 유저 그대로
        return oidcUser;
    }
}