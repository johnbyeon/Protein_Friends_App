import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

/**
 * AuthLayout: 로그인된 사용자 전용 레이아웃
 * - 미로그인 → /login으로 리다이렉트
 * - 프로필 미완성 → /app/complete-profile로 리다이렉트 (단, complete-profile 페이지는 제외)
 */
export default function AuthLayout() {
  const { token, user, profileRequired } = useAuthStore()
  const location = useLocation()
  const isAuthenticated = !!(token && user)

  // 1. 로그인 안 됨 → /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 2. 프로필 미완성 → /app/complete-profile (단, 이미 거기 있으면 통과)
  if (profileRequired && location.pathname !== '/app/complete-profile') {
    return <Navigate to="/app/complete-profile" replace />
  }

  // 3. 프로필 완성됨 + complete-profile 페이지에 있으면 → /app/home
  if (!profileRequired && location.pathname === '/app/complete-profile') {
    return <Navigate to="/app/home" replace />
  }

  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  )
}
