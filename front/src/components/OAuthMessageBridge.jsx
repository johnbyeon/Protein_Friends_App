import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'

const ALLOWED_ORIGINS = ['http://localhost:8080','https://proteinfriends.shop']

export default function OAuthMessageBridge() {
  const loginFromResponse = useAuthStore(s => s.loginFromResponse)
  
  useEffect(() => {
    async function handleMessage(event) {
      if (!ALLOWED_ORIGINS.includes(event.origin)) return
      const data = event.data
      console.log('[LoginResponse]', data)

      if (data && typeof data === 'object' && data.access_token) {
        try {
          // await 하여 스토어가 완전히 업데이트되도록 함
          await loginFromResponse(data)
        } catch (e) {
          console.warn('[OAuthBridge] loginFromResponse 실패', e)
        }
        // 상태가 반영되면 안전하게 이동
        const redirectTo = data.need_profile ? '/auth/complete-profile' : '/'
        window.location.assign(redirectTo)
        return
      }

      if (data && typeof data === 'object' && (data.error || data.status === 'error')) {
        useAuthStore.getState().setAuthError?.(
          data.error_description || data.message || data.error || '로그인에 실패했습니다.'
        )
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [loginFromResponse])

  return null
}