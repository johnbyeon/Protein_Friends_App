import { useState } from 'react'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'

export default function ProfileRequiredModal({ currentPath = '/', onSaved }) {
  const { user, setUser, setProfileRequired } = useAuthStore()
  const [name, setName]   = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
  const res = await api('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || '저장 실패')
      }
      const updated = await res.json()
      setUser(updated)
      setProfileRequired(false)
      onSaved?.()
    } catch (e) {
      setError(e.message || '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-2">필수 정보 입력</h2>
        <p className="text-sm text-gray-500 mb-4">
          계속 이용하려면 이름과 휴대폰 번호를 입력하세요.
        </p>
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="block text-sm mb-1">이름</label>
            <input className="w-full border rounded px-3 py-2"
                   value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">휴대폰 번호</label>
            <input className="w-full border rounded px-3 py-2"
                   value={phone} onChange={e => setPhone(e.target.value)}
                   placeholder="010-1234-5678" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button disabled={saving}
                  className="w-full rounded-lg font-bold py-3 disabled:opacity-60"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'black' }}>
            {saving ? '저장중…' : '저장하고 계속하기'}
          </button>
        </form>
      </div>
    </div>
  )
}