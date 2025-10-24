import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function RequireAuth() {
  const token = useAuthStore(s => s.token)
  return token ? <Outlet/> : <Navigate to="/login" replace />
}

export function RequireRole({ anyOf }) {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  return anyOf.includes(user.role) ? <Outlet/> : <Navigate to="/403" replace />
}
