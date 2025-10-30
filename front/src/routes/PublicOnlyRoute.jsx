import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function PublicOnlyRoute({ element }) {
  const { token, user } = useAuthStore()
  if (token && user) return <Navigate to="/" replace />
  return element
}