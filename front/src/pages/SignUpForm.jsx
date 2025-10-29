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
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
      <main className="flex flex-1 items-center justify-center py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-background-light/5 dark:bg-background-dark/50 p-8 shadow-2xl border border-primary/30 ring-1 ring-primary/20">
          
          {/* 헤더 */}
          <div className="flex items-center justify-center gap-1 text-gray-800 dark:text-white mb-6">
            <img src={pfLogo} alt="Protein Friends Logo" className="w-10 h-10 object-contain" />
            <h2 className="text-3xl font-bold">Protein Friends</h2>
          </div>

          {/* 폼 */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4 rounded-md">
              <input id="email-address" type="email" placeholder="이메일 ID" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="form-input block w-full rounded-lg border px-3 py-4"
              />
              <input id="password" type="password" placeholder="비밀번호" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="form-input block w-full rounded-lg border px-3 py-4"
              />
              <input id="confirm-password" type="password" placeholder="비밀번호 확인" required
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input block w-full rounded-lg border px-3 py-4"
              />
              <input id="name" type="text" placeholder="이름" required
                value={name} onChange={(e) => setName(e.target.value)}
                className="form-input block w-full rounded-lg border px-3 py-4"
              />
              <input id="phone-number" type="tel" placeholder="휴대폰 번호" required
                value={phone} onChange={(e) => setPhone(e.target.value)}
                className="form-input block w-full rounded-lg border px-3 py-4"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div>
              <button type="submit" disabled={loading}
                className="w-full rounded-lg font-bold py-3 disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-primary)', color: 'black' }}>
                {loading ? '처리중…' : '회원가입'}
              </button>
            </div>
          </form>

          {/* 구분선 */}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background-dark px-2 text-gray-500 dark:text-gray-400">또는 다음으로 가입</span>
            </div>
          </div>

          {/* 소셜 버튼 */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button type="button" onClick={() => handleSocialLogin('google')}>구글</button>
            <button type="button" onClick={() => handleSocialLogin('naver')}>네이버</button>
            <button type="button" onClick={() => handleSocialLogin('kakao')}>카카오</button>
          </div>

          <div className="mt-6 flex justify-between text-sm">
            <Link className="font-medium text-primary" to="/login">로그인으로 돌아가기</Link>
            <div>
              <Link className="font-medium text-primary mr-4" to="/auth/find-id">아이디 찾기</Link>
              <Link className="font-medium text-primary" to="/auth/reset-password">비밀번호 찾기</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}