import { useEffect } from 'react'
import Navbar from './components/Navbar'
import OAuthMessageBridge from './components/OAuthMessageBridge'
import { initAuthTimers, useAuthStore } from './stores/authStore'
import AppRoutes from './routes/AppRoutes'


export default function App() {
    const { user } = useAuthStore()
  
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
