import { useEffect } from 'react'
import Navbar from './components/Navbar'
import OAuthMessageBridge from './components/OAuthMessageBridge'
import { initAuthTimers } from './stores/authStore'
import AppRoutes from './routes/AppRoutes'


export default function App() {
  console.log('🔥 VITE_SERVER_ORIGIN:', import.meta.env.VITE_SERVER_ORIGIN)
  useEffect(() => {
    initAuthTimers()

    const listener = (event) => {
    if (!event.data || !event.data.access_token) return
    console.log('[Global OAuth Message Received]', event.origin, event.data)

    const { loginFromResponse } = useAuthStore.getState()
    loginFromResponse(event.data)
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
