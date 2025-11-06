import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

/**
 * RoleGuard: 역할별 접근 제어
 * @param {React.ReactNode} children - 렌더할 컴포넌트
 * @param {string[]} allowedRoles - 접근 허용 역할 배열 (예: ['USER'], ['TRAINER', 'ADMIN'])
 * @param {string} redirectTo - 접근 거부 시 리다이렉트할 경로 (기본: /app/home)
 */
export default function RoleGuard({ children, allowedRoles, redirectTo = '/app/home' }) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const userRole = user.role // "USER", "TRAINER", "ADMIN"
  const hasAccess = allowedRoles.includes(userRole)

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
