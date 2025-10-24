import { useAuthStore } from '../stores/authStore'

export async function api(input, init = {}) {
  const token = useAuthStore.getState().token
  const headers = new Headers(init.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(input, { ...init, headers })
  if (res.status !== 401) return res

  // 401 → 한 번 리프레시 시도
  const ok = await (async () => {
    const { refreshToken, loginFromResponse, logout } = useAuthStore.getState()
    if (!refreshToken) return false
    const r = await fetch('/api/auth/refresh', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    })
    if (!r.ok) { logout(); return false }
    const data = await r.json()
    loginFromResponse(data)
    return true
  })()

  if (!ok) return res

  // 갱신 성공 → 원요청 재시도
  const token2 = useAuthStore.getState().token
  const headers2 = new Headers(init.headers || {})
  if (token2) headers2.set('Authorization', `Bearer ${token2}`)
  return fetch(input, { ...init, headers: headers2 })
}