import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function applyRoleTheme(role) {
  const el = document.documentElement
  if (role && role.includes('ADMIN')) el.setAttribute('data-role', 'admin')
  else el.setAttribute('data-role', 'user')  // ← 기본을 유저로 강제
}

let expiryTimer = null
function scheduleExpiry(expiresAt, onExpire) {
  if (expiryTimer) { clearTimeout(expiryTimer); expiryTimer = null }
  if (!expiresAt) return
  const ms = Math.max(0, expiresAt - Date.now())
  expiryTimer = setTimeout(onExpire, ms)
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      expiresAt: null, // epoch ms

      loginFromResponse: (data) => {
        const ttlSec = data.expires_in ?? 3600
        const expiresAt = Date.now() + ttlSec * 1000
        set({
          token: data.access_token,
          refreshToken: data.refresh_token ?? null,
          user: data.user,
          expiresAt
        })
        applyRoleTheme(data.user?.role)
        scheduleExpiry(expiresAt, async () => {
          if (!get().refreshToken) return get().logout()
          try {
            const ok = await refreshTokens()
            if (!ok) get().logout()
          } catch { get().logout() }
        })
      },

      setUser: (user) => {
        set({ user })
        applyRoleTheme(user?.role || null)
      },

      logout: () => {
        set({ token: null, refreshToken: null, user: null, expiresAt: null })
        applyRoleTheme(null)
        if (expiryTimer) { clearTimeout(expiryTimer); expiryTimer = null }
      },
    }),
    { name: 'auth-store' }
  )
)

// 앱 시작시(새로고침) 저장된 만료시각으로 타이머 복원
export function initAuthTimers() {
  const { expiresAt, logout, refreshToken } = useAuthStore.getState()
  scheduleExpiry(expiresAt, async () => {
    if (!refreshToken) return logout()
    try {
      const ok = await refreshTokens()
      if (!ok) logout()
    } catch { logout() }
  })
}

// 리프레시 토큰 플로우(백엔드 경로만 맞춰줘)
async function refreshTokens() {
  const { refreshToken, loginFromResponse } = useAuthStore.getState()
  if (!refreshToken) return false
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  })
  if (!res.ok) return false
  const data = await res.json()
  loginFromResponse(data) // access/exp/user 갱신
  return true
}