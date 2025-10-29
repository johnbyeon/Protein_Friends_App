import { useAuthStore } from '../stores/authStore'

export async function checkProfileAfterLogin(afterLoginPath = '/') {
  const { token, setProfileRequired } = useAuthStore.getState()
  if (!token) return

  const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
  try {
    const res = await fetch(`${SERVER_ORIGIN}/api/users/profile-status`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) {
      console.warn('[checkProfileAfterLogin] 서버 응답 실패', res.status)
      return
    }

    const data = await res.json()
    console.log('[checkProfileAfterLogin] profileRequired:', data.profileRequired)

    setProfileRequired(!!data.profileRequired)

    if (data.profileRequired) {
      window.location.href = '/auth/complete-profile'
    } else {
      window.location.href = afterLoginPath
    }
  } catch (err) {
    console.error('[checkProfileAfterLogin] 오류 발생:', err)
  }
}