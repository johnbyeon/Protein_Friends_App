import { useState, useEffect } from 'react'
import { get, post } from '../../lib/api'
import { useBranchStore } from '../../stores/branchStore'
import { useAuthStore } from '../../stores/authStore'
import { useAccessStore } from '../../stores/accessStore'

const AccessCheck = () => {
  const { user, token } = useAuthStore()
  const { isCheckedIn, selectedGymId, checkedInLocation, setAccessState, resetAccess } = useAccessStore() // 스토어 상태 직접 사용
  const { branches, fetchBranches } = useBranchStore()
  const [currentTime, setCurrentTime] = useState('')
  const [selectedGId, setSelectedGId] = useState(null) // 로컬: 선택 시 임시 사용
  const [selectedLocation, setSelectedLocation] = useState('')
  const [currentCapacity, setCurrentCapacity] = useState(0)
  const [showEntryPopup, setShowEntryPopup] = useState(false)
  const [showExitPopup, setShowExitPopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')

  useEffect(() => {
  console.log('📊 현재 스토어 상태 (마운트 시):', { isCheckedIn, selectedGymId, checkedInLocation });
}, []);  // 빈 배열로 테스트

  // ✅ 지점 목록 로드
  useEffect(() => {
    fetchBranches()
  }, [])

  // ✅ 스토어 상태 초기 동기화 (로그인 시 복원된 상태 반영)
  useEffect(() => {
    if (isCheckedIn) {
      setSelectedGId(selectedGymId)
      setSelectedLocation(checkedInLocation)
    } else {
      setSelectedGId(null)
      setSelectedLocation('')
    }
  }, [isCheckedIn, selectedGymId, checkedInLocation])

  // ✅ 현재 인원 조회 (selectedGymId 또는 selectedGId 변경 시)
  useEffect(() => {
    const gid = selectedGymId || selectedGId
    if (gid) {
      const fetchCapacity = async () => {
        try {
          const response = await get(`/api/access/capacity/${gid}`)
          if (response.ok) {
            const data = await response.json()
            setCurrentCapacity(data.currentCapacity)
          }
        } catch (error) {
          console.error('현재 인원 조회 오류:', error)
        }
      }
      fetchCapacity()
    }
  }, [selectedGymId, selectedGId])

  // ✅ 시간 표시
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const h = String(now.getHours()).padStart(2, '0')
      const m = String(now.getMinutes()).padStart(2, '0')
      const s = String(now.getSeconds()).padStart(2, '0')
      setCurrentTime(`${h}:${m}:${s}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // ✅ 지점 선택 핸들러 (입장 상태가 아닐 때만 변경 가능)
  const handleLocationChange = (e) => {
    if (isCheckedIn) return // 입장 중에는 변경 불가
    const gId = Number(e.target.value)
    setSelectedGId(isNaN(gId) ? null : gId)
    const found = branches.find(loc => loc.gid === gId)
    setSelectedLocation(found ? found.gname : '')
    setCurrentCapacity(0)
  }

  // ✅ 입장/퇴장 요청 (스토어 업데이트 추가)
  const handleEntry = async () => {
    if (loading) return
    const gid = selectedGymId || selectedGId // 스토어 우선
    if (!gid) {
      alert('지점을 선택해주세요.')
      return
    }
    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }

    setLoading(true)
    const endpoint = isCheckedIn ? '/api/access/exit' : '/api/access/entry'

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_ORIGIN}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ gid }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        if (isCheckedIn) {
          setResponseMessage(data.message || '퇴장하셨습니다.')
          setShowExitPopup(true)
          resetAccess() // 퇴장 성공 시 스토어 리셋
        } else {
          const gname = data.gname || selectedLocation
          setAccessState({ // 입장 성공 시 스토어 업데이트
            isCheckedIn: true,
            selectedGymId: gid,
            checkedInLocation: gname,
          })
          setResponseMessage(data.message || `${gname}에 입장하셨습니다.`)
          setShowEntryPopup(true)
        }
      } else {
        alert(data.error || '요청 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('출입 처리 오류:', error)
      alert('요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ 입장 확인 (인원 재조회)
  const confirmEntry = async () => {
    setShowEntryPopup(false)
    const gid = selectedGymId || selectedGId
    if (gid) {
      try {
        const response = await get(`/api/access/capacity/${gid}`)
        if (response.ok) {
          const data = await response.json()
          setCurrentCapacity(data.currentCapacity)
        }
      } catch (error) {
        console.error('인원 조회 오류:', error)
      }
    }
  }

  // ✅ 퇴장 확인 (인원 재조회 + 초기화)
  const confirmExit = async () => {
    setShowExitPopup(false)
    const gid = selectedGymId || selectedGId
    if (gid) {
      try {
        const response = await get(`/api/access/capacity/${gid}`)
        if (response.ok) {
          const data = await response.json()
          setCurrentCapacity(data.currentCapacity)
        }
      } catch (error) {
        console.error('인원 조회 오류:', error)
      }
    }
    setSelectedLocation('')
    setSelectedGId(null)
    setCurrentCapacity(0)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
      <main className="flex flex-col items-center justify-center flex-grow text-center">
        <h1 className="text-5xl font-bold text-black dark:text-white mb-2">출입 체크</h1>
        <div className="text-9xl font-black text-primary mb-8 tabular-nums tracking-tighter">
          {currentTime}
        </div>

        {/* ✅ 지점 선택 (입장 시 disabled, 선택된 지점 고정) */}
        <div className="mb-8 w-full max-w-xs">
          <select
            id="location-select"
            value={selectedGymId || selectedGId || ''} // 스토어 우선
            onChange={handleLocationChange}
            disabled={isCheckedIn} // 글로벌 상태로 disabled
            className="custom-select bg-background-dark border border-primary text-primary text-xl rounded-lg
           focus:ring-primary focus:border-primary block w-full p-4
           disabled:bg-gray-800 disabled:border-gray-600 disabled:text-gray-400"
            style={{
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2306f906' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="">지점을 선택하세요</option>
            {branches.map((branch) => (
              <option key={branch.gid} value={branch.gid}>
                {branch.gname}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ 현재 인원 */}
        {selectedLocation && (
          <div className="mb-8 text-center">
            <div className="text-xl text-primary mb-2">현재 인원</div>
            <div className="text-8xl font-bold text-primary tabular-nums">
              {currentCapacity}
            </div>
          </div>
        )}

        {/* ✅ 입장/퇴장 버튼 (글로벌 상태 반영) */}
        <button
          onClick={handleEntry}
          disabled={loading}
          className="bg-primary text-background-dark font-bold text-2xl px-12 py-5 rounded-lg
                   hover:bg-primary/90 transition-colors duration-300
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : (isCheckedIn ? '퇴장하기' : '입장하기')}
        </button>
      </main>

      {/* ✅ 입장 팝업 */}
      {showEntryPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowEntryPopup(false)}>
          <div className="bg-background-dark p-8 rounded-lg text-center shadow-lg">
            <p className="text-white text-2xl mb-4">{responseMessage}</p>
            <button onClick={confirmEntry}
              className="bg-primary text-background-dark font-bold px-6 py-2 rounded-lg hover:bg-primary/90">
              확인
            </button>
          </div>
        </div>
      )}

      {/* ✅ 퇴장 팝업 */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowExitPopup(false)}>
          <div className="bg-background-dark p-8 rounded-lg text-center shadow-lg">
            <p className="text-white text-2xl mb-4">{responseMessage}</p>
            <button onClick={confirmExit}
              className="bg-primary text-background-dark font-bold px-6 py-2 rounded-lg hover:bg-primary/90">
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccessCheck