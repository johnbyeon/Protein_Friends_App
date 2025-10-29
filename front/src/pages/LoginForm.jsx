import { useState } from 'react'
import { Link } from 'react-router-dom'
import pfLogo from '../assets/pflogo.svg'
import { useAuthStore } from '../stores/authStore'
import { openSocialPopup } from '../utils/openSocialPopup'

function tryDecodeJwt(token) {
  try {
    const [, payload] = token.split('.')
    return JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/')))
  } catch { return null }
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

  const API_BASE = import.meta.env.VITE_API_BASE ?? window.location.origin;
  const LOGIN_URL = `${API_BASE}${loginEndpoint}`

  // ✅ 일반 로그인
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (typeof clearAuthError === 'function') clearAuthError();
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
          } catch {}
          console.error('[Login] server error', res.status, message)
          throw new Error(message)
        }
        // ✅ 응답 처리 — 1순위: JSON 바디, 2순위: Authorization 헤더
        let data = null;

        // 먼저 JSON 바디를 시도 (need_profile 포함 수신)
        try {
          data = await res.clone().json();
        } catch {
          data = null;
        }

        // 바디에 토큰이 없으면 헤더에서 보완
        if (!data || !data.access_token) {
          const auth = res.headers.get('Authorization');
          if (auth && auth.startsWith('Bearer ')) {
            const token = auth.substring(7);
            const decoded = tryDecodeJwt(token) || {};
            const nowSec = Math.floor(Date.now() / 1000);
            const ttl = decoded.exp ? Math.max(10, decoded.exp - nowSec) : 3600;

            // 헤더만 온 경우에도 최소한의 데이터 구성
            data = {
              access_token: token,
              expires_in: ttl,
              user: {
                email: decoded.email ?? email,
                role: decoded.role ?? 'ROLE_USER',
              },
              // 헤더 경로에서는 need_profile 정보를 알 수 없으므로 기본 false
              need_profile: false,
            };
          } else {
            throw new Error('토큰 응답이 없습니다.');
          }
        }

        // 디버깅 로그
        console.log('[LoginResponse] payload =', data);
        console.log('[LoginResponse] need_profile =', data?.need_profile);

        // 상태 반영
        await loginFromResponse(data);

        // ✅ 프로필 필요 여부 따라 이동 (명시적 비교)
        const redirectTo =
          data?.need_profile === true ? '/auth/complete-profile' : '/';
        console.log('[LoginRedirect] ->', redirectTo);
        window.location.assign(redirectTo);
      }
    } catch (e) {
      setError(e.message || '로그인에 실패했습니다.')
      if (typeof setAuthError === 'function') setAuthError(e.message || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }


const listener = async (event) => {
  const allowedOrigins = new Set([
    // 백엔드 OAuth 콜백이 실행되는 오리진
    import.meta.env.VITE_BACKEND_ORIGIN ?? window.location.origin,
    // 프론트 자신의 오리진(리디렉트 페이지 등에서 메시지 보낼 수 있음)
    window.location.origin,
    // 필요 시 도메인 하드코드(운영)
    'https://proteinfriends.shop',
    'https://www.proteinfriends.shop',
  ])

  if (!allowedOrigins.has(event.origin)) return

      const data = event.data
      if (data && data.access_token) {
        try {
          await loginFromResponse(data)
          console.log(`✅ ${provider} 로그인 성공:`, data)
        } catch (e) {
          console.warn('[SocialLogin] loginFromResponse 에러', e)
        }
        window.removeEventListener('message', listener)

        // 프로필 필요 여부에 따라 리다이렉트
        const redirectTo = data.need_profile === true ? '/auth/complete-profile' : '/'
        console.log('[SocialLoginRedirect] ->', redirectTo)
        window.location.assign(redirectTo)
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

            {/* 에러 메시지 (로컬 오류 + 스토어 오류 모두 표시) */}
            {(error || authError) && (
              <div className="text-sm text-red-400">
                {error || authError}
                {authError && (
                  <button
                    type="button"
                    className="ml-2 underline"
                    onClick={typeof clearAuthError === 'function' ? clearAuthError : undefined}
                  >
                    닫기
                  </button>
                )}
              </div>
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
            <button type="button" onClick={() => {console.log('🖱️ 구글 로그인 버튼 클릭됨')
            openSocialPopup('google', '/')}}>구글</button>
            <button type="button" onClick={() => {console.log('🖱️ 구글 로그인 버튼 클릭됨')
              openSocialPopup('naver', '/')}}>네이버</button>
            <button type="button" onClick={() => openSocialPopup('kakao', '/')}>카카오</button>
          </div>
        </div>
      </main>
    </div>
  )
}
