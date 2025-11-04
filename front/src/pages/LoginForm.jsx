import { useState } from 'react'
import { Link } from 'react-router-dom'
import pfLogo from '../assets/pflogo.svg'
import { useAuthStore } from '../stores/authStore'
import { openSocialPopup } from '../utils/openSocialPopup'

// ✅ JWT 디코딩 유틸
function tryDecodeJwt(token) {
  try {
    const [, payload] = token.split('.')
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export default function LoginForm({
  onLogin,
  loginEndpoint = '/api/auth/login',
}) {
  const { loginFromResponse, authError, clearAuthError, setAuthError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
  const LOGIN_URL = `${SERVER_ORIGIN}${loginEndpoint}`

  // ✅ 일반 로그인
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (typeof clearAuthError === 'function') clearAuthError()
    setLoading(true)
    try {
      if (onLogin) {
        await onLogin(email, password)
      } else {
        const res = await fetch(LOGIN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (!res.ok) {
          let message = `로그인에 실패했습니다. [${res.status}]`
          try {
            const txt = await res.text()
            try {
              const j = JSON.parse(txt)
              message = j.message || j.error || message
            } catch {
              if (txt) message = txt
            }
          } catch { }
          console.error('[Login] server error', res.status, message)
          throw new Error(message)
        }

        // ✅ 응답 처리 — 1순위: JSON 바디, 2순위: Authorization 헤더
        let data = null
        try {
          data = await res.clone().json()
        } catch {
          data = null
        }

        if (!data || !data.access_token) {
          const auth = res.headers.get('Authorization')
          if (auth && auth.startsWith('Bearer ')) {
            const token = auth.substring(7)
            const decoded = tryDecodeJwt(token) || {}
            const nowSec = Math.floor(Date.now() / 1000)
            const ttl = decoded.exp ? Math.max(10, decoded.exp - nowSec) : 3600

            data = {
              access_token: token,
              expires_in: ttl,
              user: {
                email: decoded.email ?? email,
                role: decoded.role ?? 'ROLE_USER',
              },
              need_profile: false,
            }
          } else {
            throw new Error('토큰 응답이 없습니다.')
          }
        }

        console.log('[LoginResponse] payload =', data)
        console.log('[LoginResponse] need_profile =', data?.need_profile)

        await loginFromResponse(data)

        const redirectTo =
          data?.need_profile === true ? '/auth/complete-profile' : '/'
        console.log('[LoginRedirect] ->', redirectTo)
        window.location.assign(redirectTo)
      }
    } catch (e) {
      setError(e.message || '로그인에 실패했습니다.')
      if (typeof setAuthError === 'function')
        setAuthError(e.message || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ 소셜 로그인 (팝업 방식)
  const handleSocialLogin = (provider) => {
    console.log(`🌐 ${provider} 로그인 팝업 열림`)
    const serverOrigin =
      import.meta.env.VITE_SERVER_ORIGIN ?? ''

    const popupUrl = `${serverOrigin}/oauth2/authorization/${provider}?r=${Date.now()}`;
    const popup = window.open(
      popupUrl,
      `${provider}-login`,
      'width=500,height=600,noopener=no'
    );

    const listener = async (event) => {
      const allowedOrigins = new Set([
        import.meta.env.VITE_BACKEND_ORIGIN ?? ''
      ])

      if (!allowedOrigins.has(event.origin)) return
      console.log(`[OAuth Message Received] ${event.origin}`, event.data)
      const data = event.data
      if (data && data.access_token) {
        try {
          await loginFromResponse(data)
          console.log(`✅ ${provider} 로그인 성공:`, data)
        } catch (e) {
          console.warn('[SocialLogin] loginFromResponse 에러', e)
        }
        window.removeEventListener('message', listener)

        const redirectTo =
          data.need_profile === true ? '/auth/complete-profile' : '/'
        console.log('[SocialLoginRedirect] ->', redirectTo)
        window.location.assign(redirectTo)
      }
    }

    window.addEventListener('message', listener)
  }

  // ✅ JSX 렌더링
  return (
    <div className="flex min-h-screen flex-col bg-background-dark font-display text-text-light">
      <main className="flex flex-1 items-center justify-center py-12 sm:px-6 lg:px-8">
        <div
          className="w-full max-w-md space-y-8 rounded-xl dark:bg-background-dark/50 
           shadow-2xl border border-primary/20 ring-1 ring-primary/30 p-10 transition-all duration-300"
        >
          {/* 헤더 */}
          <div className="text-center mb-8">
            <Link to="/" className="flex justify-center mb-4">
              <img src={pfLogo} alt="Protein Friends" className="w-16 h-16" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Protein Friends
            </h1>
            <p className="text-gray-400 text-sm mt-2">함께 성장하는 피트니스 커뮤니티</p>
          </div>

          {/* 폼 */}
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <input
              id="email-address"
              type="email"
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full rounded-lg border border-primary/20  
              bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 
              focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none 
              transition-all duration-200"
            />

            <input
              id="password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-lg border border-primary/20  
              bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 
              focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none 
              transition-all duration-200"
            />

            {(error || authError) && (
              <p className="text-sm text-red-400 mt-2">
                {error || authError}
                {authError && (
                  <button
                    type="button"
                    onClick={clearAuthError}
                    className="ml-2 underline"
                  >
                    닫기
                  </button>
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 rounded-lg py-3 font-semibold 
              text-black bg-[var(--color-primary)] hover:opacity-90 
              active:scale-[0.97] transition-all duration-150"
            >
              {loading ? '처리중…' : '로그인'}
            </button>
          </form>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background-dark px-2 text-gray-400">
                또는 소셜 로그인
              </span>
            </div>
          </div>

          {/* 소셜 로그인 버튼 */}

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button type="button" className="rounded-lg border border-primary/20 py-2 
                text-sm text-gray-400 font-medium 
                hover:bg-[var(--color-blue)] hover:text-white
                hover:border-[var(--color-blue)] transition-all 
                duration-200" onClick={() => handleSocialLogin('google')}>
                  GOOGLE
                  </button>
            <button type="button" className="rounded-lg border border-primary/20 py-2 
                text-sm text-gray-400 font-medium hover:bg-[var(--color-green)] 
                hover:text-white transition-all 
                hover:border-[var(--color-green)] duration-200"onClick={() => handleSocialLogin('naver')}>
                  NAVER
                </button>
            <button type="button" className="rounded-lg border border-primary/20 py-2 
                text-sm text-gray-400 font-medium hover:bg-[var(--color-yellow)] 
                hover:text-black transition-all 
                hover:border-[var(--color-yellow)] duration-200" onClick={() => handleSocialLogin('kakao')}>
                  KAKAO
                  </button>
          </div>



          {/* 링크 영역 */}
          <div className="flex justify-between text-sm text-gray-400 mt-6">
            <Link to="/auth/register" className="hover:text-primary">회원가입</Link>
            <div className="space-x-3">
              <Link to="/auth/find-id" className="hover:text-primary">아이디 찾기</Link>
              <Link to="/auth/reset-password" className="hover:text-primary">비밀번호 찾기</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}