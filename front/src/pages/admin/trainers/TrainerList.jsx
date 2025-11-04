import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../../../lib/api'
import { useBranchStore } from '../../../stores/branchStore'

export default function TrainerList() {
  const navigate = useNavigate()
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 필터 및 페이지네이션
  const [gymId, setGymId] = useState('')
  const [employed, setEmployed] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  // Zustand에서 지점 목록 가져오기
  const { branches, fetchBranches } = useBranchStore()

  // 지점 목록 불러오기
  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  // 트레이너 목록 불러오기
  useEffect(() => {
    fetchTrainers()
  }, [gymId, employed, searchQuery, page])

  const fetchTrainers = async () => {
    setLoading(true)
    setError('')

    try {
      // 쿼리 파라미터 구성
      const params = new URLSearchParams()
      if (gymId) params.append('gymId', gymId)
      if (employed !== '') params.append('employed', employed)
      if (searchQuery) params.append('q', searchQuery)
      params.append('page', page)
      params.append('size', pageSize)
      params.append('sort', '-tId') // 최신순

      const res = await get(`/api/admin/trainers?${params.toString()}`)

      if (res.ok) {
        const data = await res.json()
        setTrainers(data.content || [])
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } else {
        setError('트레이너 목록을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('트레이너 목록 조회 에러:', err)
      setError('트레이너 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 트레이너 삭제
  const handleDelete = async (tId, tName) => {
    if (!window.confirm(`${tName} 트레이너를 삭제하시겠습니까?`)) {
      return
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_ORIGIN}/api/admin/trainers/${tId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
          },
        }
      )

      if (res.ok) {
        alert('트레이너가 삭제되었습니다.')
        fetchTrainers() // 목록 새로고침
      } else {
        alert('삭제에 실패했습니다.')
      }
    } catch (err) {
      console.error('삭제 에러:', err)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  // 검색 실행
  const handleSearch = () => {
    setPage(0) // 검색 시 첫 페이지로
    fetchTrainers()
  }

  // 필터 초기화
  const handleReset = () => {
    setGymId('')
    setEmployed('')
    setSearchQuery('')
    setPage(0)
  }

  return (
    <div className="min-h-screen bg-background-dark p-10">
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-4xl font-bold tracking-tight text-white">
          트레이너 정보
        </h2>
        <button
          onClick={() => navigate('/admin/trainers/new')}
          className="rounded-md bg-primary py-2.5 px-6 text-base font-bold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          트레이너 등록
        </button>
      </div>

      {/* 필터 */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* 지점 선택 */}
        <select
          value={gymId}
          onChange={(e) => setGymId(e.target.value)}
          className="rounded-lg border border-border-dark bg-surface-dark px-4 py-2 text-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
        >
          <option value="">전체 지점</option>
          {Array.isArray(branches) &&
            branches.map((branch) => (
              <option key={branch.gid} value={branch.gid}>
                {branch.gName || branch.gname}
              </option>
            ))}
        </select>

        {/* 재직 상태 */}
        <select
          value={employed}
          onChange={(e) => setEmployed(e.target.value)}
          className="rounded-lg border border-border-dark bg-surface-dark px-4 py-2 text-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
        >
          <option value="">전체 상태</option>
          <option value="true">재직 중</option>
          <option value="false">퇴직</option>
        </select>

        {/* 검색 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="이름 검색"
            className="rounded-lg border border-border-dark bg-surface-dark px-4 py-2 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="rounded-lg bg-gray-600 px-4 py-2 font-semibold text-white hover:bg-gray-500"
          >
            검색
          </button>
        </div>

        {/* 초기화 */}
        <button
          onClick={handleReset}
          className="rounded-lg border border-border-dark px-4 py-2 font-semibold text-gray-400 hover:bg-surface-dark hover:text-white"
        >
          초기화
        </button>
      </div>

      {/* 총 개수 */}
      <div className="mb-4 text-sm text-gray-400">
        총 {totalElements}명의 트레이너
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-900/20 border border-red-500 p-4 text-red-400">
          {error}
        </div>
      )}

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-lg border border-border-dark">
        <table className="min-w-full divide-y divide-border-dark">
          <thead className="bg-surface-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                트레이너 번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                지점
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                트레이너 정보
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                생년월일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                연락처
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark bg-surface-dark">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : trainers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                  트레이너가 없습니다.
                </td>
              </tr>
            ) : (
              trainers.map((trainer) => (
                <tr key={trainer.tId}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                    T{String(trainer.tId).padStart(3, '0')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                    {trainer.gymName || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={trainer.tImageUrl || '/default-avatar.png'}
                        alt={trainer.tName}
                        className="h-12 w-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '/default-avatar.png'
                        }}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {trainer.tName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {trainer.userEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                    {trainer.tBirthDay || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                    {trainer.tPhoneNumber || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {trainer.isEmployed ? (
                      <span className="inline-flex rounded-full bg-green-900/20 px-2 py-1 text-xs font-semibold text-green-400">
                        재직 중
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-900/20 px-2 py-1 text-xs font-semibold text-gray-400">
                        퇴직
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => navigate(`/admin/trainers/${trainer.tId}`)}
                      className="mr-4 cursor-pointer text-gray-400 hover:text-white"
                      title="상세보기"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                    <button
                      onClick={() => navigate(`/admin/trainers/${trainer.tId}/edit`)}
                      className="mr-4 cursor-pointer text-gray-400 hover:text-white"
                      title="수정"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(trainer.tId, trainer.tName)}
                      className="cursor-pointer text-gray-400 hover:text-red-400"
                      title="삭제"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 0 && (
        <div className="mt-6 flex justify-center">
          <nav aria-label="Pagination" className="inline-flex -space-x-px rounded-md shadow-sm">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="relative inline-flex items-center rounded-l-md border border-border-dark bg-surface-dark px-2 py-2 text-sm font-medium text-gray-400 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx)}
                className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                  page === idx
                    ? 'z-10 border-primary bg-primary/20 text-primary'
                    : 'border-border-dark bg-surface-dark text-gray-400 hover:bg-primary/10'
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="relative inline-flex items-center rounded-r-md border border-border-dark bg-surface-dark px-2 py-2 text-sm font-medium text-gray-400 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}
