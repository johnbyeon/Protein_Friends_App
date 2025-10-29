import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { api } from '../lib/api'
import ProfileRequiredModal from './ProfileRequiredModal'

export default function ProfileGate({ children }) {
  const { token, user, profileRequired, setUser, setProfileRequired } = useAuthStore()
  const [ready, setReady] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      if (!token) { setReady(true); return }
      if (user?.name && user?.phone) { setProfileRequired(false); setReady(true); return }
      try {
  const res = await api('/api/users/me')
        if (res.ok) {
          const me = await res.json()
          setUser(me)
          setProfileRequired(!(me?.name && me?.phone))
        }
      } catch {}
      setReady(true)
    })()
  }, [token, user?.name, user?.phone, setUser, setProfileRequired])

  // 로그인 안됐으면 통과 (라우팅에서 별도 보호)
  if (!token) return children
  if (!ready) return null

  const need = profileRequired || !(useAuthStore.getState().user?.name && useAuthStore.getState().user?.phone)
  return (
    <>
      {children}
      {need && <ProfileRequiredModal currentPath={location.pathname} onSaved={() => {
        setProfileRequired(false)
        // 저장 후 원래 페이지 유지
      }} />}
      {/* 클릭 막기 */}
      {need && <div className="fixed inset-0 z-[999] pointer-events-auto" />}
    </>
  )
}