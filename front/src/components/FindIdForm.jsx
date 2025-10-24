import { useState } from 'react'
import { Link } from 'react-router-dom'
import pfLogo from '../assets/pflogo.svg'

export default function FindIdForm({
  onFindId,                  // (name, phone) => Promise<string>
  findIdEndpoint = '/api/auth/find-id',  // onFindId 미전달 시 fetch로 사용
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [foundId, setFoundId] = useState('')
  const [showPopup, setShowPopup] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      if (onFindId) {
        const id = await onFindId(name, phone)
        setFoundId(id)
        setShowPopup(true)
      } else {
        const res = await fetch(findIdEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || '아이디 찾기에 실패했습니다.')
        }
        const data = await res.json()
        setFoundId(data.id)
        setShowPopup(true)
      }
    } catch (e) {
      setError(e.message || '아이디 찾기에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(foundId)
      alert('아이디가 복사되었습니다.')
    } catch (err) {
      console.error('Could not copy text: ', err)
      alert('아이디 복사에 실패했습니다.')
    }
  }

  const closePopup = () => {
    setShowPopup(false)
    setFoundId('')
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
              아이디 찾기
            </h2>
          </div>

          {/* 폼 */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4 rounded-md">
              <div>
                <label className="sr-only" htmlFor="name">이름</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="이름"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input relative block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark px-3 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark sm:text-sm transition-all duration-200"
                />
              </div>
              <div>
                <label className="sr-only" htmlFor="phone-number">휴대폰 번호</label>
                <input
                  id="phone-number"
                  name="phone-number"
                  type="tel"
                  autoComplete="tel"
                  placeholder="휴대폰 번호"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                {loading ? '처리중…' : '아이디 찾기'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link className="text-sm font-medium text-primary hover:text-primary/90" to="/login">
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </main>

      {/* 팝업 모달 */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
             onClick={(e) => e.target === e.currentTarget && closePopup()}>
          <div className="w-full max-w-sm rounded-none bg-black p-8 shadow-lg border border-zinc-800">
            <div className="text-center">
              <h3 className="text-lg font-medium leading-6 text-white">아이디 찾기 완료</h3>
              <div className="mt-4">
                <p className="text-sm text-gray-400">회원님의 아이디입니다.</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <p className="text-lg font-bold text-primary">{foundId}</p>
                  <button 
                    className="text-primary hover:text-primary/80" 
                    title="Copy ID" 
                    type="button"
                    onClick={handleCopyId}
                  >
                    <span className="material-symbols-outlined">content_copy</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col space-y-3">
              <Link 
                className="flex w-full justify-center border border-transparent bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary/90 focus:outline-none" 
                to="/login"
              >
                로그인
              </Link>
              <button 
                className="flex w-full justify-center border border-zinc-600 bg-transparent px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 focus:outline-none" 
                type="button"
                onClick={closePopup}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
