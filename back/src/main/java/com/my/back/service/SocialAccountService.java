package com.my.back.service;

import com.my.back.dto.SocialLinkRequest;
import com.my.back.entity.SocialAccount;
import com.my.back.entity.Users;
import com.my.back.repository.SocialAccountRepository;
import com.my.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 소셜 계정 연결 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SocialAccountService {

    private final SocialAccountRepository socialAccountRepository;
    private final UserRepository userRepository;

    /**
     * 소셜 계정 연결
     * @param uId 현재 로그인된 사용자 ID
     * @param request 소셜 계정 정보
     * @return 연결된 SocialAccount
     */
    @Transactional
    public SocialAccount linkSocialAccount(Long uId, SocialLinkRequest request) {
        Users user = userRepository.findById(uId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + uId));

        // 이미 해당 소셜 계정이 다른 사용자에게 연결되어 있는지 확인
        Optional<SocialAccount> existing = socialAccountRepository
                .findByProviderAndProviderUserId(request.getProvider(), request.getProviderUserId());

        if (existing.isPresent() && !existing.get().getUsers().getUId().equals(uId)) {
            throw new IllegalStateException("이 소셜 계정은 이미 다른 사용자에게 연결되어 있습니다.");
        }

        // 이미 현재 사용자에게 연결되어 있으면 업데이트
        if (existing.isPresent() && existing.get().getUsers().getUId().equals(uId)) {
            SocialAccount socialAccount = existing.get();
            socialAccount.setAccessToken(request.getAccessToken());
            socialAccount.setRefreshToken(request.getRefreshToken());
            if (request.getTokenExpiresIn() != null) {
                socialAccount.setTokenExpiresAt(LocalDateTime.now().plusSeconds(request.getTokenExpiresIn()));
            }
            socialAccount.setActive(true);
            socialAccount.setDisconnectedAt(null);
            
            log.info("소셜 계정 업데이트: {} - {}", request.getProvider(), request.getProviderUserId());
            return socialAccountRepository.save(socialAccount);
        }

        // 새로 연결
        LocalDateTime expiresAt = null;
        if (request.getTokenExpiresIn() != null) {
            expiresAt = LocalDateTime.now().plusSeconds(request.getTokenExpiresIn());
        }

        SocialAccount socialAccount = SocialAccount.builder()
                .users(user)
                .provider(request.getProvider())
                .providerUserId(request.getProviderUserId())
                .accessToken(request.getAccessToken())
                .refreshToken(request.getRefreshToken())
                .tokenExpiresAt(expiresAt)
                .active(true)
                .build();

        SocialAccount saved = socialAccountRepository.save(socialAccount);

        // Users 테이블의 연결 플래그 업데이트
        updateUserLinkFlag(user, request.getProvider(), true);

        log.info("소셜 계정 연결 성공: {} - {}", request.getProvider(), request.getProviderUserId());
        return saved;
    }

    /**
     * 소셜 계정 연결 해제
     * @param uId 사용자 ID
     * @param provider 소셜 제공자
     */
    @Transactional
    public void unlinkSocialAccount(Long uId, String provider) {
        Users user = userRepository.findById(uId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + uId));

        // 해당 provider의 SocialAccount 찾기
        Optional<SocialAccount> socialAccountOpt = user.getSocialAccounts().stream()
                .filter(sa -> sa.getProvider().equalsIgnoreCase(provider) && sa.getActive())
                .findFirst();

        if (socialAccountOpt.isEmpty()) {
            throw new IllegalStateException(provider + " 계정이 연결되어 있지 않습니다.");
        }

        SocialAccount socialAccount = socialAccountOpt.get();
        socialAccount.disconnect();
        socialAccountRepository.save(socialAccount);

        // Users 테이블의 연결 플래그 업데이트
        updateUserLinkFlag(user, provider, false);

        log.info("소셜 계정 연결 해제 성공: {} - {}", provider, uId);
    }

    /**
     * Users 테이블의 소셜 연결 플래그 업데이트
     */
    private void updateUserLinkFlag(Users user, String provider, boolean linked) {
        switch (provider.toLowerCase()) {
            case "google":
                user.setGoogleLinked(linked);
                break;
            case "naver":
                user.setNaverLinked(linked);
                break;
            case "kakao":
                user.setKakaoLinked(linked);
                break;
            default:
                log.warn("Unknown provider: {}", provider);
        }
        userRepository.save(user);
    }
}

