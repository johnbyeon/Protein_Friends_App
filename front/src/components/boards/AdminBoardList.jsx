import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useBoardTypeStore } from '../../stores/boardTypeStore'
import { useAuthStore } from '../../stores/authStore'

/**
 * 관리자용 게시판 목록 페이지 (테이블 형식)
 * - 게시글 추가/수정/삭제 기능
 * - 팝업 설정, 공개 여부 표시
 */
export default function AdminBoardList() {
  const { typeAddressName } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { boardTypes, fetchBoardTypes } = useBoardTypeStore()
  const { user } = useAuthStore()

  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentType, setCurrentType] = useState(null)
  const [selectedBoard, setSelectedBoard] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 사용자 role에 따른 기본 경로 설정
  const getBasePath = () => {
    if (user?.role === 'ROLE_ADMIN') return '/admin'
    if (user?.role === 'ROLE_TRAINER') return '/trainer'
    // 현재 경로에서 추출 (fallback)
    if (location.pathname.startsWith('/trainer')) return '/trainer'
    return '/admin'
  }

  // 게시글 타입 정보 찾기 및 현재 타입 설정
  useEffect(() => {
    const loadBoardTypesAndSetCurrent = async () => {
      // boardTypes가 없으면 로드
      if (boardTypes.length === 0) {
        await fetchBoardTypes()
      }
      
      // boardTypes가 있고 typeAddressName이 있으면 현재 타입 설정
      if (boardTypes.length > 0 && typeAddressName) {
        const type = boardTypes.find(t => t.ptypeaddressName === typeAddressName)
        if (type && (!currentType || currentType.ptypeid !== type.ptypeid)) {
          setCurrentType(type)
        }
      }
    }
    
    loadBoardTypesAndSetCurrent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeAddressName])

  // 게시글 목록 불러오기
  useEffect(() => {
    let isMounted = true
    
    const loadBoards = async () => {
      if (!currentType?.ptypeid) return

      setLoading(true)
      setError(null)

      try {
        const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
        const token = localStorage.getItem('jwt')

        const response = await fetch(`${SERVER_ORIGIN}/api/admin/boards/type/${currentType.ptypeid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.status === 401) {
          navigate('/login')
          return
        }

        if (!response.ok) {
          throw new Error('게시글 목록을 불러오는데 실패했습니다.')
        }

        const data = await response.json()
        
        // 컴포넌트가 마운트된 상태에서만 상태 업데이트
        if (isMounted) {
          setBoards(data)
        }
      } catch (err) {
        console.error('게시글 목록 조회 에러:', err)
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadBoards()
    
    // cleanup 함수
    return () => {
      isMounted = false
    }
  }, [currentType?.ptypeid, navigate])

  // 게시글 상세 모달 열기
  const handleRowClick = async (pid) => {
    try {
      const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
      const token = localStorage.getItem('jwt')

      const response = await fetch(`${SERVER_ORIGIN}/api/boards/${pid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('게시글을 불러오는데 실패했습니다.')
      }

      const data = await response.json()
      setSelectedBoard(data)
      setIsModalOpen(true)
    } catch (err) {
      console.error('게시글 조회 에러:', err)
      alert(err.message)
    }
  }

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedBoard(null)
  }

  // 게시글 삭제
  const handleDelete = async (e, pid, pTitle) => {
    e.stopPropagation() // 행 클릭 이벤트 전파 방지
    
    if (!confirm(`"${pTitle}" 게시글을 삭제하시겠습니까?`)) {
      return
    }

    try {
      const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
      const token = localStorage.getItem('jwt')

      const response = await fetch(`${SERVER_ORIGIN}/api/admin/boards/${pid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('게시글 삭제에 실패했습니다.')
      }

      alert('게시글이 삭제되었습니다.')
      // 목록 새로고침
      setBoards(boards.filter(board => board.pid !== pid))
      closeModal()
    } catch (err) {
      console.error('게시글 삭제 에러:', err)
      alert(err.message)
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '-').replace('.', '')
  }

  // 팝업 기간 표시
  const getPopupPeriod = (board) => {
    if (!board.pisPopup) return null
    if (board.isAlwaysPopup) return '상시'
    if (board.isUnlimited) return '상시'
    return formatDate(board.ppopupStartDate)
  }

  if (!currentType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-gray-400">게시판 타입을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-background-dark p-8">

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">{currentType.ptypename}</h1>
        <Link
          to={`${getBasePath()}/boards/${typeAddressName}/new`}
          className="bg-primary text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">add</span>
          <span>새 {currentType.ptypename} 작성</span>
        </Link>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-gray-400">게시글을 불러오는 중...</div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-400">{error}</div>
        </div>
      )}

      {/* 게시글 목록 테이블 */}
      {!loading && !error && boards.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400">등록된 게시글이 없습니다.</div>
        </div>
      )}

      {!loading && !error && boards.length > 0 && (
        <div className="bg-background-dark/50 rounded-lg border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-xs uppercase text-white/60">
                <tr>
                  <th className="px-6 py-3" scope="col">번호</th>
                  <th className="px-6 py-3" scope="col">이미지</th>
                  <th className="px-6 py-3 w-1/4" scope="col">제목</th>
                  <th className="px-6 py-3" scope="col">작성자</th>
                  <th className="px-6 py-3" scope="col">날짜</th>
                  <th className="px-6 py-3" scope="col">수정 날짜</th>
                  <th className="px-6 py-3" scope="col">조회수</th>
                  <th className="px-6 py-3" scope="col">팝업 설정</th>
                  <th className="px-6 py-3" scope="col">팝업 시작</th>
                  <th className="px-6 py-3" scope="col">팝업 종료</th>
                  <th className="px-6 py-3" scope="col">공개 여부</th>
                  <th className="px-6 py-3" scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {boards.map((board, index) => (
                  <tr 
                    key={board.pid} 
                    className="border-b border-white/10 hover:bg-white/5 cursor-pointer"
                    onClick={() => handleRowClick(board.pid)}
                  >
                    {/* 번호 */}
                    <td className="px-6 py-4 text-white/80">{boards.length - index}</td>

                    {/* 이미지 */}
                    <td className="px-6 py-4">
                      {board.pimageUrl ? (
                        <img
                          alt={board.ptitle}
                          className="w-16 h-10 object-cover rounded-md"
                          src={board.pimageUrl}
                        />
                      ) : (
                        <div className="w-16 h-10 bg-white/5 rounded-md flex items-center justify-center">
                          <span className="material-symbols-outlined text-white/30">image_not_supported</span>
                        </div>
                      )}
                    </td>

                    {/* 제목 */}
                    <th className="px-6 py-4 font-medium text-white whitespace-nowrap" scope="row">
                      {board.ptitle}
                    </th>

                    {/* 작성자 */}
                    <td className="px-6 py-4 text-white/80">{board.trainerName || 'Admin'}</td>

                    {/* 날짜 */}
                    <td className="px-6 py-4 text-white/80">{formatDate(board.pcreateDate)}</td>

                    {/* 수정 날짜 */}
                    <td className="px-6 py-4 text-white/80">{formatDate(board.pupdateDate)}</td>

                    {/* 조회수 */}
                    <td className="px-6 py-4 text-white/80">{board.viewCount || 0}</td>

                    {/* 팝업 설정 */}
                    <td className="px-6 py-4 text-white/80">
                      {board.pisPopup ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">설정</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">미설정</span>
                      )}
                    </td>

                    {/* 팝업 시작 기간 */}
                    <td className="px-6 py-4 text-white/80">
                      {board.pisPopup ? getPopupPeriod(board) : '-'}
                    </td>

                    {/* 팝업 종료 기간 */}
                    <td className="px-6 py-4 text-white/80">
                      {board.pisPopup ? (
                        board.isAlwaysPopup || board.isUnlimited ? '상시' : formatDate(board.ppopupEndDate)
                      ) : '-'}
                    </td>

                    {/* 공개 여부 */}
                    <td className="px-6 py-4 text-white/80">
                      {board.psetVisible ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">공개</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">비공개</span>
                      )}
                    </td>

                    {/* 액션 버튼 */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`${getBasePath()}/boards/${typeAddressName}/${board.pid}/edit`}
                          className="font-medium text-primary hover:underline"
                          title="수정"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </Link>
                        <button
                          onClick={(e) => handleDelete(e, board.pid, board.ptitle)}
                          className="font-medium text-red-400 hover:underline"
                          title="삭제"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 게시글 상세 모달 */}
      {isModalOpen && selectedBoard && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div 
            className="bg-background-dark w-full max-w-4xl rounded-xl border border-white/10 shadow-lg flex flex-col max-h-[90vh] m-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{selectedBoard.ptitle}</h2>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span>작성자: {selectedBoard.trainerName || 'Admin'}</span>
                  <span>•</span>
                  <span>{formatDate(selectedBoard.pcreateDate)}</span>
                  <span>•</span>
                  <span>조회수 {selectedBoard.viewCount || 0}</span>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="text-white/70 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* 본문 */}
            <div className="p-6 flex-1 overflow-y-auto">
              {/* 이미지 (링크가 있으면 클릭 가능) */}
              {selectedBoard.pimageUrl && (
                <div className="mb-6">
                  {selectedBoard.plink ? (
                    <a 
                      href={selectedBoard.plink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block cursor-pointer group"
                    >
                      <img 
                        src={selectedBoard.pimageUrl} 
                        alt={selectedBoard.ptitle}
                        className="w-full max-h-96 object-contain rounded-lg group-hover:opacity-90 transition-opacity"
                      />
                      <div className="mt-2 text-sm text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        <span>이미지 클릭 시 링크로 이동</span>
                      </div>
                    </a>
                  ) : (
                    <img 
                      src={selectedBoard.pimageUrl} 
                      alt={selectedBoard.ptitle}
                      className="w-full max-h-96 object-contain rounded-lg"
                    />
                  )}
                </div>
              )}

              {/* 내용 */}
              <div className="text-white/90 whitespace-pre-wrap leading-relaxed">
                {selectedBoard.pcontent}
              </div>

              {/* 팝업 정보 */}
              {selectedBoard.pisPopup && (
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <span className="material-symbols-outlined">campaign</span>
                    <span className="font-medium">팝업으로 설정됨</span>
                  </div>
                  <div className="text-sm text-white/60">
                    {selectedBoard.isAlwaysPopup || selectedBoard.isUnlimited ? (
                      <span>상시 팝업</span>
                    ) : (
                      <span>
                        {formatDate(selectedBoard.ppopupStartDate)} ~ {formatDate(selectedBoard.ppopupEndDate)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 푸터 - 액션 버튼 */}
            <div className="flex items-center justify-end p-6 border-t border-white/10 gap-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={(e) => handleDelete(e, selectedBoard.pid, selectedBoard.ptitle)}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                삭제
              </button>
              <Link
                to={`${getBasePath()}/boards/${typeAddressName}/${selectedBoard.pid}/edit`}
                className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
                onClick={closeModal}
              >
                수정
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
