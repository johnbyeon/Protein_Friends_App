import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function OAuthLogin() {
  const { loginFromResponse, logout } = useAuthStore()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('jwt')
    if (token) setIsLoggedIn(true)
  }, [])

  const handleLogin = (provider) => {
    const popup = window.open(
      `http://localhost:8080/oauth2/authorization/${provider}?r=${Date.now()}`,
      `${provider}-login`,
      'width=500,height=600,noopener=no'
    )

    const listener = (event) => {
      if (event.origin !== 'http://localhost:8080') return
      const data = event.data
      if (data && data.access_token) {
        loginFromResponse(data)
        console.log(`✅ ${provider} 로그인 성공`)
        window.removeEventListener('message', listener)
        window.location.reload()
      }
    }
    window.addEventListener('message', listener)
  }

  if (isLoggedIn)
    return (
      <div className="text-center mt-20">
        <p>✅ 로그인됨</p>
        <button onClick={logout}>로그아웃</button>
      </div>
    )

  return (
    <div className="text-center mt-20">

    </div>
  )
}
