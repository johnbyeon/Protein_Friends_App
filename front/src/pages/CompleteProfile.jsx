import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function CompleteProfile() {
  const { user, setUser, setProfileRequired } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN ?? '';
  const token = localStorage.getItem('jwt')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // 1️⃣ 프로필 저장
      const res = await fetch(`${SERVER_ORIGIN}/api/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone }),
      })
      if (!res.ok) throw new Error('프로필 저장 실패')

      const updated = await res.json()
      setUser(updated) // 스토어 user 갱신

      // 2️⃣ 저장 후 서버에 다시 상태 확인
      const chk = await fetch(`${SERVER_ORIGIN}/api/users/profile-status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const st = await chk.json()

      // 3️⃣ 상태에 따라 처리
      setProfileRequired(!!st.profileRequired)

      if (!st.profileRequired) {
        setMessage('✅ 프로필이 완료되었습니다! 홈으로 이동합니다.')
        setTimeout(() => (window.location.href = '/'), 1000)
      } else {
        setMessage('⚠️ 입력 정보가 부족합니다. 다시 확인해주세요.')
      }
    } catch (err) {
      console.error(err)
      setMessage('❌ 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center py-12 sm:px-6 lg:px-8 min-h-screen flex-col bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-8 rounded-xl bg-background-light/5 dark:bg-background-dark/50 p-8 shadow-2xl border border-primary/30 ring-1 ring-primary/20"
      >
        <h1 className="text-2xl font-bold mb-4">추가 정보 입력</h1>
        <p className="text-sm text-gray-400 mb-6">
          소셜 로그인으로 가입된 경우
          <br />
          이름과 전화번호를 입력해야 이용이 가능합니다.
        </p>

        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="block w-full rounded-lg border border-primary/20
              bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500
              focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none
              transition-all duration-200"
        />

        <input
          type="tel"
          placeholder="전화번호"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="block w-full rounded-lg border border-primary/20
              bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500
              focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none
              transition-all duration-200"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-lg font-bold py-3 disabled:opacity-60 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.95]"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'black',
          }}
        >
          {loading ? '처리중…' : '저장하기'}
        </button>

        {message && <p className="mt-3 text-center text-sm">{message}</p>}
      </form>
    </div>
  )
}