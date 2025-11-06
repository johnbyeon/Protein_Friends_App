import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

/**
 * RoleGuard: 역할별 접근 제어
 * @param {React.ReactNode} children - 렌더할 컴포넌트
 * @param {string[]} allowedRoles - 접근 허용 역할 배열 (예: ['USER'], ['TRAINER', 'ADMIN'])
 * @param {string} redirectTo - 접근 거부 시 리다이렉트할 경로 (기본: /app/home)
 */
export default function RoleGuard({ children, allowedRoles, redirectTo = null }) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const userRole = user.role // "USER", "TRAINER", "ADMIN"
  const hasAccess = allowedRoles.includes(userRole)

  if (!hasAccess) {
    // 역할에 따른 적절한 리다이렉트 경로 결정
    let redirectPath = redirectTo || '/home'
    
    if (!redirectTo) {
      switch (userRole) {
        case 'USER':
          redirectPath = '/home'
          break
        case 'TRAINER':
          redirectPath = '/trainer/dashboard'
          break
        case 'ADMIN':
          redirectPath = '/admin/dashboard'
          break
        default:
          redirectPath = '/home'
      }
    }
    
    return <Navigate to={redirectPath} replace />
  }

  return children
}
