import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

/**
 * PublicLayout: 비로그인 사용자 전용 레이아웃
 * 로그인된 사용자는 /app으로 리다이렉트
 */
export default function PublicLayout() {
  const { token, user } = useAuthStore()
  const isAuthenticated = !!(token && user)

  // 이미 로그인된 경우 /app으로
  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="public-layout">
      <Outlet />
    </div>
  )
}
