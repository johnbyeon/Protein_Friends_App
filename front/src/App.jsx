import { useEffect } from 'react'
import Navbar from './components/navbar/Navbar'
import OAuthMessageBridge from './components/OAuthMessageBridge'
import { initAuthTimers, useAuthStore } from './stores/authStore'
import AppRoutes from './routes'
import "./styles/lightStreaks.css";


export default function App() {

    const { user, token, setUser } = useAuthStore()
  
    useEffect(() => {
      if (user?.role) {
        // role은 이미 ROLE_이 빠진 상태 (ex. "USER", "TRAINER", "ADMIN")
        let role = user.role.toLowerCase()
  
        // 트레이너를 관리자 계열로 통합
        if (role === 'trainer') role = 'admin'
  
        document.documentElement.setAttribute('data-role', role)
      } else {
        // 로그아웃 시 초기화
        document.documentElement.removeAttribute('data-role')
      }
    }, [user])

    // 앱 로드 시 최신 사용자 정보 가져오기 (profilePicture 포함)
    useEffect(() => {
      const refreshUserInfo = async () => {
        if (!token) return

        try {
          const base = import.meta.env.VITE_API_BASE ?? ''
          const res = await fetch(`${base}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const me = await res.json()
            setUser(me)
            console.log('✅ 앱 로드 시 사용자 정보 새로고침 (profilePicture 포함)', me)
          }
        } catch (e) {
          console.error('❌ 사용자 정보 새로고침 실패', e)
        }
      }

      refreshUserInfo()
    }, [token, setUser])

  console.log('🔥 VITE_SERVER_ORIGIN:', import.meta.env.VITE_SERVER_ORIGIN)
  useEffect(() => {
    initAuthTimers()
  }, [])

  useEffect(() => {
    const { loginFromResponse } = useAuthStore.getState()
    if (!loginFromResponse) {
      console.error('❌ loginFromResponse not found in store')
      return
    }

    const listener = (event) => {
      console.log('[🌍 Global OAuth Message Received]', event.origin, event.data)
      if (!event.data?.access_token) return
      try {
        loginFromResponse(event.data)
        console.log('✅ Global loginFromResponse called from OAuth message')
      } catch (err) {
        console.error('⚠️ loginFromResponse execution failed:', err)
      }
    }
    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [])
  return (
    <>
      {/* 전역 OAuth 메시지 브리지: 팝업에서 postMessage 수신 */}
      <OAuthMessageBridge />
      <Navbar />
      <AppRoutes />
    </>
  )

}
