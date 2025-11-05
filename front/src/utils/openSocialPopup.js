import { useAuthStore } from '../stores/authStore'

/**
 * Opens a popup for social login and listens for OAuth2 success messages.
 * @param {string} provider - The social login provider ("google", "kakao", "naver")
 * @param {string} redirectPath - The path to redirect to after successful login
 * @param {string} mode - "login" or "link" (default: "login")
 */
export function openSocialPopup(provider, redirectPath = '/', mode = 'login') {
  console.log(`🌐 ${provider} ${mode === 'link' ? '계정 연결' : '로그인'} 팝업 열림`)

  const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN ?? ''

  const popup = window.open(
    `${SERVER_ORIGIN}/oauth2/authorization/${provider}?mode=${mode}&r=${Date.now()}`,
    `${provider}-${mode}`,
    'width=500,height=600,noopener=no'
  )

  const listener = async (event) => {
    const data = event.data;
    const withWww = SERVER_ORIGIN.replace('://', '://www.');
    const noWww = SERVER_ORIGIN.replace('://www.', '://');
    const allowedOrigins = new Set([SERVER_ORIGIN, withWww, noWww]);

    if (!allowedOrigins.has(event.origin)) {
      console.warn('[OAuth Message Ignored] Origin not allowed:', event.origin);
      return;
    }

    console.log('[OAuth Message Received]', event.origin, data);
    
    // "link" 모드인 경우 소셜 계정 연결 API 호출
    if (mode === 'link' && data.mode === 'link') {
      try {
        const { post } = await import('../lib/api');
        
        const linkRequest = {
          provider: data.provider,
          providerUserId: data.provider_user_id,
          accessToken: 'oauth_token_' + Date.now(), // 실제 OAuth access token (나중에 구현)
          refreshToken: null,
          tokenExpiresIn: null
        };

        console.log('📤 소셜 계정 연결 요청:', linkRequest);

        const res = await post('/api/users/me/social/link', linkRequest);
        
        if (res.ok) {
          const text = await res.text();
          alert(`✅ ${text}`);
          console.log(`✅ ${data.provider} 계정 연결 성공`);
        } else {
          const errorText = await res.text();
          alert(`❌ 연결 실패: ${errorText}`);
          console.error(`❌ ${data.provider} 계정 연결 실패:`, errorText);
        }
      } catch (err) {
        console.error('⚠️ 소셜 계정 연결 중 오류:', err);
        alert('소셜 계정 연결 중 오류가 발생했습니다.');
      } finally {
        window.removeEventListener('message', listener);
        if (popup && !popup.closed) popup.close();
        window.location.href = redirectPath;
      }
      return;
    }

    // 로그인 모드는 access_token 필수
    if (!data || !data.access_token) return;

    // "login" 모드인 경우 기존 로그인 로직 수행
    // ✅ need_profile 문자열을 boolean으로 변환
    const needProfileRaw = data.need_profile ?? data.profileRequired;
    const needProfile = String(needProfileRaw).toLowerCase() === 'true';

    try {
      const store = useAuthStore.getState();
      if (!store || typeof store.loginFromResponse !== 'function') {
        console.error('❌ loginFromResponse not found in useAuthStore:', store);
        return;
      }

      await store.loginFromResponse({
        access_token: data.access_token,
        refresh_token: data.refresh_token ?? null,
        expires_in: data.expires_in ?? null,
        user: data.user ?? null,
        need_profile: needProfile ?? false,
      });

      console.log(`✅ ${provider} 로그인 성공, server need_profile=${data.need_profile}`);
    } catch (err) {
      console.error('⚠️ 로그인 상태 갱신 중 오류:', err);
    } finally {
      window.removeEventListener('message', listener);
      if (popup && !popup.closed) popup.close();

      const profileReq = useAuthStore.getState().profileRequired;
      if (profileReq) {
        window.location.href = '/auth/complete-profile';
      } else {
        window.location.href = redirectPath;
      }
    }
  };

  window.addEventListener('message', listener)
}
