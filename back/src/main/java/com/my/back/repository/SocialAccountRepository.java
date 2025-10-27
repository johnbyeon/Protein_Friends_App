package com.my.back.repository;

import com.my.back.entity.SocialAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SocialAccountRepository extends JpaRepository<SocialAccount, Long> {

    /** 특정 소셜(provider, provider_user_id) 조합 존재 여부 확인 */
    boolean existsByProviderAndProviderUserId(String provider, String providerUserId);

    /** 특정 소셜(provider, provider_user_id) 조합으로 조회 */
    Optional<SocialAccount> findByProviderAndProviderUserId(String provider, String providerUserId);
}
