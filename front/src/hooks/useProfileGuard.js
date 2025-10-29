// ✅ named export 방식
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function useProfileGuard() {
  const { token, profileRequired } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (token && profileRequired && location.pathname !== '/auth/complete-profile') {
      navigate('/auth/complete-profile')
    }
  }, [token, profileRequired, location.pathname])
}