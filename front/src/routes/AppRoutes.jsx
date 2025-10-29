import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import ProtectedRoute from './ProtectedRoute'
import { PublicRoutes } from './PublicRoutes'
import { AuthRoutes } from './AuthRoutes'
import { AdminRoutes } from './AdminRoutes'
import MyInfo from '../pages/MyInfo'
import Home from '../pages/Home'

export default function AppRoutes() {
  const { user } = useAuthStore()
  const role = user?.role || ''

  const isAuthenticated = !!user

  return (
    <Routes>
      {/* 기본 홈 경로 */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            role === 'ROLE_ADMIN' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <ProtectedRoute element={<Home />} />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 공용, 인증, 관리자 페이지 */}
      {PublicRoutes}
      {AuthRoutes}
      {AdminRoutes}

      {/* 잘못된 경로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}