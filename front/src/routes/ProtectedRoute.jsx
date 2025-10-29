// src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function ProtectedRoute({ element, role }) {
  const { token, user, profileRequired } = useAuthStore()

  if (!token || !user) return <Navigate to="/login" replace />
  if (profileRequired) return <Navigate to="/auth/complete-profile" replace />
  if (role && !user.role.includes(role)) return <Navigate to="/" replace />

  return element
}
