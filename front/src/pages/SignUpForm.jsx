import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import pfLogo from '../assets/pflogo.svg'
import { useAuthStore } from '../stores/authStore'
import { openSocialPopup } from '../utils/openSocialPopup'

// ✅ 소셜 로그인 버튼 클릭
const handleSocialLogin = (provider) => {
  try {
    localStorage.setItem('oauth_mode', 'login')
    localStorage.setItem('oauth_redirect_after', '/auth/register')
  } catch {}
  openSocialPopup(provider, '/auth/register')
}

export default function SignUpForm({
  onSignUp,
  signUpEndpoint = '/api/auth/join',
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loginFromResponse = useAuthStore(s => s.loginFromResponse)
  const isLoggedIn = useAuthStore(s => !!s.token)
  const navigate = useNavigate();

  // ✅ 환경 기반 서버 주소 통일
  const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || window.location.origin

  useEffect(() => {
    if (isLoggedIn) navigate('/')
  }, [isLoggedIn, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    try {
      if (onSignUp) {
        await onSignUp(email, password, confirmPassword, name, phone)
      } else {
        const res = await fetch(`${SERVER_ORIGIN}${signUpEndpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, phone }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || '회원가입에 실패했습니다.')
        }
        // ✅ 회원가입 완료 → 로그인 페이지로 이동
        window.location.href = `${window.location.origin}/login`
      }
    } catch (e) {
      setError(e.message || '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background-dark font-display text-text-light">
      <main className="flex flex-1 items-center justify-center py-12 sm:px-6 lg:px-8">
        <div
          className="w-full max-w-md space-y-8 rounded-2xl border  outline-none p-10 transition-all duration-300"
        >
          {/* 헤더 */}
          <div className="text-center mb-8">
            <Link to="/" className="flex justify-center mb-4">
              <img src={pfLogo} alt="Protein Friends" className="w-16 h-16" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Protein Friends
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              함께 성장하는 피트니스 커뮤니티
            </p>
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
              className="block w-full rounded-lg border border-border-dark 
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
              className="block w-full rounded-lg border border-border-dark 
              bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 
              focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none 
              transition-all duration-200"
            />
            <input
              id="confirm-password"
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="block w-full rounded-lg border border-border-dark 
              bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 
              focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none 
              transition-all duration-200"
            />
            <input
              id="name"
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block w-full rounded-lg border border-border-dark 
              bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 
              focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none 
              transition-all duration-200"
            />
            <input
              id="phone-number"
              type="tel"
              placeholder="휴대폰 번호"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="block w-full rounded-lg border border-border-dark 
              bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 
              focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none 
              transition-all duration-200"
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 rounded-lg py-3 font-semibold text-black 
              bg-[var(--color-primary)] hover:opacity-90 active:scale-[0.97] 
              transition-all duration-150 "
            >
              {loading ? '처리중…' : '회원가입'}
            </button>
          </form>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-light" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background-dark px-2 text-gray-400">
                또는 소셜 회원가입
              </span>
            </div>
          </div>

          {/* 소셜 버튼 */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button type="button" className="rounded-lg border border-border-dark py-2 
                text-sm font-medium hover:bg-[var(--color-blue)] 
                hover:text-white transition-all duration-200" onClick={() => handleSocialLogin('google')}>
                  GOOGLE
                  </button>
            <button type="button" className="rounded-lg border border-border-dark py-2 
                text-sm font-medium hover:bg-[var(--color-green)] 
                hover:text-white transition-all duration-200"onClick={() => handleSocialLogin('naver')}>
                  NAVER
                </button>
            <button type="button" className="rounded-lg border border-border-dark py-2 
                text-sm font-medium hover:bg-[var(--color-yellow)] 
                hover:text-black transition-all duration-200" onClick={() => handleSocialLogin('kakao')}>
                  KAKAO
                  </button>
          </div>

          {/* 하단 링크 */}
          <div className="flex justify-between text-sm text-gray-400 mt-6">
            <Link to="/login" className="hover:text-primary">
              로그인으로 돌아가기
            </Link>
            <div className="space-x-3">
              <Link to="/auth/find-id" className="hover:text-primary">
                아이디 찾기
              </Link>
              <Link to="/auth/reset-password" className="hover:text-primary">
                비밀번호 찾기
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}