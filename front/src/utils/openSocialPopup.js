import { useAuthStore } from '../stores/authStore'

/**
 * Opens a popup for social login and listens for OAuth2 success messages.
 * @param {string} provider - The social login provider ("google", "kakao", "naver")
 * @param {string} redirectPath - The path to redirect to after successful login
 */
export function openSocialPopup(provider, redirectPath = '/') {
  console.log(`🌐 ${provider} 로그인 팝업 열림`)

  const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN ?? ''

  const popup = window.open(
    `${SERVER_ORIGIN}/oauth2/authorization/${provider}?r=${Date.now()}`,
    `${provider}-login`,
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
    if (!data || !data.access_token) return;

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
