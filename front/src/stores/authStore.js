// src/stores/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function applyRoleTheme(role) {
  const el = document.documentElement
  if (role && String(role).includes('ADMIN')) el.setAttribute('data-role', 'admin')
  else el.setAttribute('data-role', 'user')
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
      expiresAt: null,
      profileRequired: false,
      authError: null,
      setProfileRequired: (v) => set({ profileRequired: !!v }),
      setAuthError: (msg) => set({ authError: msg || null }),
      clearAuthError: () => set({ authError: null }),

      // ✅ 수정된 버전
      // make this async so callers can await user-fetch when needed
      loginFromResponse: async (data) => {
        try {
          console.log('💾 loginFromResponse 호출 전 데이터:', data)

          if (!data || typeof data !== 'object')
            throw new Error('잘못된 로그인 응답 형식입니다.')

          const token = data.access_token || data.token
          if (!token) throw new Error('토큰이 없습니다.')

          const ttlSec = data.expires_in ?? 3600
          const expiresAt = Date.now() + ttlSec * 1000
          let u = data.user || null
          // userRole → role 매핑 (항상 새 객체로 복사)
          if (u) {
            const role = u.role || u.userRole || ''
            u = { ...u, role }
          }


          const serverNeed = data.hasOwnProperty('need_profile') ? !!data.need_profile : null
          const calcNeed = !u || !u.name || !u.phone
          // name, phone 모두 있으면 무조건 false
          let profileRequired = (u && u.name && u.phone) ? false : (serverNeed === true ? true : calcNeed)

          set({
            token,
            refreshToken: data.refresh_token ?? null,
            user: u,
            expiresAt,
            profileRequired,
            authError: null,
          })

          applyRoleTheme(u?.role)
          scheduleExpiry(expiresAt, async () => {
            if (!get().refreshToken) return get().logout()
            try {
              const ok = await refreshTokens()
              if (!ok) get().logout()
            } catch { get().logout() }
          })

          // localStorage에도 저장 (JWT 유지)
          try {
            localStorage.setItem('jwt', token)
          } catch (e) {
            console.warn('⚠️ JWT 저장 실패:', e)
          }

          // If server didn't include full user info, try to fetch /api/users/me (항상 role까지 보장)
          if (!u || !u.role) {
            try {
              const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
              const res = await fetch(`${base}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              if (res.ok) {
                const me = await res.json()
                u = me
                set({ user: me, profileRequired: !(me?.name && me?.phone) })
                applyRoleTheme(me?.role)
                console.log('✅ /api/users/me에서 사용자 정보 로드됨', me)
              } else {
                const errText = await res.text().catch(() => '')
                console.warn('⚠️ /api/users/me 응답 실패', res.status, errText)
                // If server explicitly said need_profile=false, respect it
                if (serverNeed === false) set({ profileRequired: false })
              }
            } catch (e) {
              console.error('❌ /api/users/me 호출 중 에러', e)
            }
          }

          console.log('✅ loginFromResponse 성공:', { user: u, expiresAt })
        } catch (err) {
          console.error('❌ loginFromResponse 에러:', err)
          set({ authError: err.message || '로그인 처리 중 오류가 발생했어요.' })
        }
      },

      setUser: (user) => {
        set({ user, profileRequired: !(user?.name && user?.phone) })
        applyRoleTheme(user?.role || null)
      },

      logout: () => {
        set({
          token: null, refreshToken: null, user: null,
          expiresAt: null, profileRequired: false, authError: null
        })
        applyRoleTheme(null)
        if (expiryTimer) { clearTimeout(expiryTimer); expiryTimer = null }
      },
    }),
    { name: 'auth-store' }
  )
)

// 앱 시작 시 만료 타이머 재가동
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

async function refreshTokens() {
  const { refreshToken, loginFromResponse, logout } = useAuthStore.getState()
  if (!refreshToken) return false
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
  const res = await fetch(`${base}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  })
  if (!res.ok) { logout(); return false }
  const data = await res.json()
  await loginFromResponse(data)
  return true
}
