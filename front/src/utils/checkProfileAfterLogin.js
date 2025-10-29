import { useAuthStore } from '../stores/authStore'

export async function checkProfileAfterLogin(afterLoginPath = '/') {
  const { token, setProfileRequired } = useAuthStore.getState()
  if (!token) return

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
  const res = await fetch(`${API_BASE}/api/users/profile-status`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) return
  const data = await res.json()

  setProfileRequired(!!data.profileRequired)

  if (data.profileRequired) {
    window.location.href = '/auth/complete-profile'
  } else {
    window.location.href = afterLoginPath
  }
}