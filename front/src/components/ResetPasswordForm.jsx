import { useState } from 'react'
import { Link } from 'react-router-dom'
import pfLogo from '../assets/pflogo.svg'

export default function ResetPasswordForm({
  onResetPassword,          // (email) => Promise<void>
  resetPasswordEndpoint = '/api/auth/reset-password',  // onResetPassword 미전달 시 fetch로 사용
}) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      if (onResetPassword) {
        await onResetPassword(email)
        setSuccess(true)
      } else {
        const res = await fetch(resetPasswordEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || '비밀번호 재설정 링크 발송에 실패했습니다.')
        }
        setSuccess(true)
      }
    } catch (e) {
      setError(e.message || '비밀번호 재설정 링크 발송에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
        <main className="flex flex-1 items-center justify-center py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8 rounded-xl bg-background-light/5 dark:bg-background-dark/50 p-8 shadow-2xl border border-primary/30 ring-1 ring-primary/20"
               style={{
                 boxShadow: '0 25px 50px -12px rgba(57, 255, 20, 0.25), 0 0 0 1px rgba(57, 255, 20, 0.1)'
               }}>
            {/* 헤더 */}
            <div>
              <div className="flex items-center justify-center gap-1 text-gray-800 dark:text-white mb-6">
                <div className="mt-1 size-10 text-primary">
                  <img
                    src={pfLogo}
                    alt="Protein Friends Logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <h2 className="text-3xl font-bold">Protein Friends</h2>
              </div>
              <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                비밀번호 재설정
              </h2>
            </div>

            {/* 성공 메시지 */}
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                  <span className="material-symbols-outlined text-primary text-2xl">check</span>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                이메일을 확인해주세요
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                <span className="font-medium text-primary">{email}</span>로<br />
                비밀번호 재설정 링크를 발송했습니다.
              </p>
              <div className="space-y-3">
                <Link 
                  className="flex w-full justify-center border border-transparent bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary/90 focus:outline-none" 
                  to="/login"
                >
                  로그인으로 돌아가기
                </Link>
                <button 
                  className="flex w-full justify-center border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none" 
                  type="button"
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                  }}
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
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
            <div className="flex items-center justify-center gap-1 text-gray-800 dark:text-white mb-6">
              <div className="mt-1 size-10 text-primary">
                <img
                  src={pfLogo}
                  alt="Protein Friends Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h2 className="text-3xl font-bold">Protein Friends</h2>
            </div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              비밀번호 찾기
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
                  className="form-input relative block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark px-3 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark sm:text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg font-bold py-3 disabled:opacity-60 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.95]"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}>
                {loading ? '처리중…' : '비밀번호 재설정 링크 발송'}
              </button>
            </div>
          </form>

          <div className="text-center text-sm">
            <Link className="font-medium text-primary hover:text-primary/90" to="/login">
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
