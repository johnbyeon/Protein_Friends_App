import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import ProtectedRoute from './ProtectedRoute'
import { AuthRoutes } from './AuthRoutes'
import { AdminRoutes } from './AdminRoutes'
import { UserRoutes } from './UserRoutes'
import Home from '../pages/Home'

export default function AppRoutes() {
  const { token, user, profileRequired } = useAuthStore()
  const isAuthenticated = !!(token && user)

  return (
    <Routes>
      {/* 루트: 로그인 안됨 → /login, 로그인됨 → 홈/프로필완성 유도 */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? (profileRequired
                ? <Navigate to="/auth/complete-profile" replace />
                : <ProtectedRoute element={<Home />} />)
            : <Navigate to="/login" replace />
        }
      />

      {/* 로그인/회원가입/프로필완성 */}
      {AuthRoutes}

      {/* 유저 전용 */}
      {UserRoutes}

      {/* 트레이너/관리자 전용 */}
      {AdminRoutes}

      {/* 존재하지 않는 URL → 루트로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}