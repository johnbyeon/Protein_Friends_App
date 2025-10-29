import { useEffect } from 'react'
import Navbar from './components/Navbar'
import OAuthMessageBridge from './components/OAuthMessageBridge'
import { initAuthTimers } from './stores/authStore'
import AppRoutes from './routes/AppRoutes'


export default function App() {
  useEffect(() => {
    initAuthTimers()
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
