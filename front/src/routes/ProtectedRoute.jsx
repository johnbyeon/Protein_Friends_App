import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

/**
 * Props
 * - element: 렌더할 컴포넌트
 * - allow: 접근 허용 역할 배열 (예: ['USER'], ['TRAINER','ADMIN'])
 * - bypassProfileCheck: true면 프로필 미완성이어도 통과 (예: complete-profile 페이지)
 */
export default function ProtectedRoute({ element, allow, bypassProfileCheck = false }) {
  const { token, user, profileRequired } = useAuthStore()
  const location = useLocation()

  // 1) 로그인 체크
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 2) 프로필 미완성 → 정보입력 페이지로
  if (!bypassProfileCheck && profileRequired) {
    return <Navigate to="/auth/complete-profile" replace />
  }

  // 3) 역할 체크
  if (Array.isArray(allow) && allow.length > 0) {
    const my = user.role
    const ok = allow.some(role => normalizeRole(role) === my)
    if (!ok) return <Navigate to="/" replace />
  }

  return element
}