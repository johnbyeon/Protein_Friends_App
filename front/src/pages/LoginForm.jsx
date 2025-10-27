import { useState } from 'react'
import { Link } from 'react-router-dom'
import pfLogo from '../assets/pflogo.svg'
import { useAuthStore } from '../stores/authStore'

export default function LoginForm({
  onLogin,
  loginEndpoint = '/api/auth/login',
}) {
  const { loginFromResponse } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ✅ 일반 로그인
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (onLogin) {
        await onLogin(email, password)
      } else {
        const res = await fetch(loginEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || '로그인에 실패했습니다.')
        }
        const data = await res.json()
        loginFromResponse(data) // ✅ JWT 상태 저장
        window.location.href = '/' // 홈으로 이동
      }
    } catch (e) {
      setError(e.message || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ 소셜 로그인 (팝업 방식)
  const handleSocialLogin = (provider) => {
    console.log(`🌐 ${provider} 로그인 팝업 열림`)
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

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
      <main className="flex flex-1 items-center justify-center py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-background-light/5 dark:bg-background-dark/50 p-8 shadow-2xl border border-primary/30 ring-1 ring-primary/20"
             style={{
               boxShadow: '0 25px 50px -12px rgba(57, 255, 20, 0.25), 0 0 0 1px rgba(57, 255, 20, 0.1)'
             }}>
          {/* 헤더 */}
          <div>
            <div className="flex items-center justify-center gap-4 text-gray-800 dark:text-white mb-6">
              <div className="size-8 text-primary">
                <Link to="/" className="flex items-center gap-1 text-text-light dark:text-text-dark">
                  <img
                    src={pfLogo}
                    alt="Protein Friends Logo"
                    className="w-10 h-10 object-contain text-primary"
                  />
                </Link>
              </div>
              <h2 className="text-3xl font-bold">Protein Friends</h2>
            </div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              로그인
            </h2>
          </div>

          {/* 폼 */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4 rounded-md">
              <div>
                <label className="sr-only" htmlFor="email-address">이메일 주소</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="이메일 ID"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input relative block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark sm:text-sm transition-all duration-200"
                />
              </div>
              <div>
                <label className="sr-only" htmlFor="password">비밀번호</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="비밀번호"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input relative block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark sm:text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <div className="flex items-center justify-between text-sm">
              <div>
                <Link className="font-medium text-primary hover:text-primary/90" to="/auth/register">
                  회원가입
                </Link>
              </div>
              <div>
                <Link className="font-medium text-primary hover:text-primary/90 mr-4" to="/auth/find-id">
                  아이디찾기
                </Link>
                <Link className="font-medium text-primary hover:text-primary/90" to="/auth/reset-password">
                  비밀번호 찾기
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg font-bold py-3 disabled:opacity-60 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.95]"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'black'
                }}>
                {loading ? '처리중…' : '로그인'}
              </button>
            </div>
          </form>

          {/* 구분선 */}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background-dark px-2 text-gray-500 dark:text-gray-400">
                또는 다음으로 로그인
              </span>
            </div>
          </div>

          {/* ✅ 소셜 로그인 버튼 (팝업 연동) */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* 카카오 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('kakao')}
              className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-background-light dark:bg-black px-4 py-3 text-sm font-medium hover:bg-yellow-300 hover:border-yellow-300 hover:text-black transition-all duration-200"
            >
              카카오
            </button>

            {/* 네이버 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('naver')}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--color-primary)'
                e.target.style.borderColor = 'var(--color-primary)'
                e.target.style.color = 'black'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = ''
                e.target.style.borderColor = ''
                e.target.style.color = ''
              }}
              className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-background-light dark:bg-black px-4 py-3 text-sm font-medium transition-all duration-200"
            >
              네이버
            </button>

            {/* 구글 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-background-light dark:bg-black px-4 py-3 text-sm font-medium hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-200"
            >
              구글
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
