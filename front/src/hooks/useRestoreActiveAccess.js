import { useEffect } from 'react'
import { get } from '../lib/api'
import { useAccessStore } from '../stores/accessStore'
import { useBranchStore } from '../stores/branchStore'
import { useAuthStore } from '../stores/authStore'

/**
 * 로그인 직후 사용자의 최근 출입 상태를 서버에서 조회하여 복원하는 훅
 * - /api/access/active 호출 → { active, gId, lastDirection, lastTime }
 * - active=true면 accessStore에 현재 입장 상태 저장
 */
export function useRestoreActiveAccess() {
  const { token } = useAuthStore()
  const { branches } = useBranchStore()
  const { setAccessState, resetAccess } = useAccessStore()

  useEffect(() => {
    if (!token) return // 로그인 상태일 때만 동작

    const restore = async () => {
      try {
        const res = await get('/api/access/active')
        if (!res.ok) {
          resetAccess()
          return
        }

        const data = await res.json() // { active, gId, ... }
        if (data.active && data.gId) {
          const gym = branches.find(b => b.gid === data.gId)
          setAccessState({
            isCheckedIn: true,
            selectedGymId: data.gId,
            checkedInLocation: gym?.gname || '',
          })
          console.log('✅ 출입 상태 복원 완료:', data)
        } else {
          resetAccess()
        }
      } catch (err) {
        console.error('출입 상태 복원 오류:', err)
        resetAccess()
      }
    }

    restore()
  }, [token, branches])
}
