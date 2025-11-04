import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useBoardTypeStore } from '../../stores/boardTypeStore'

/**
 * 관리자용 게시판 목록 페이지
 * - 유저용과 달리 게시글 추가 버튼 포함
 * - 수정/삭제 버튼 포함
 * - 노출 여부 표시
 */
export default function AdminBoardList() {
  const { typeAddressName } = useParams()
  const navigate = useNavigate()
  const { boardTypes, fetchBoardTypes } = useBoardTypeStore()

  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentType, setCurrentType] = useState(null)

  // 게시글 타입 정보 찾기
  useEffect(() => {
    const loadBoardTypes = async () => {
      if (boardTypes.length === 0) {
        await fetchBoardTypes()
      }
    }
    loadBoardTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardTypes.length])

  // 현재 타입 설정
  useEffect(() => {
    if (boardTypes.length > 0 && typeAddressName) {
      const type = boardTypes.find(t => t.ptypeaddressName === typeAddressName)
      setCurrentType(type)
    }
  }, [boardTypes, typeAddressName])

  // 게시글 목록 불러오기 (관리자는 모든 게시글 조회)
  useEffect(() => {
    const loadBoards = async () => {
      if (!currentType) return

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
        setBoards(data)
      } catch (err) {
        console.error('게시글 목록 조회 에러:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadBoards()
  }, [currentType, navigate])

  // 게시글 삭제
  const handleDelete = async (pId, pTitle) => {
    if (!confirm(`"${pTitle}" 게시글을 삭제하시겠습니까?`)) {
      return
    }

    try {
      const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
      const token = localStorage.getItem('jwt')

      const response = await fetch(`${SERVER_ORIGIN}/api/admin/boards/${pId}`, {
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
      setBoards(boards.filter(board => board.pId !== pId))
    } catch (err) {
      console.error('게시글 삭제 에러:', err)
      alert(err.message)
    }
  }

  if (!currentType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-gray-400">게시판 타입을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 + 게시글 추가 버튼 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-light mb-2">
              {currentType.ptypename} 관리
            </h1>
            <div className="h-1 w-20 bg-primary rounded"></div>
          </div>
          <Link
            to={`/admin/boards/${typeAddressName}/new`}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg
              hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined">add</span>
            게시글 추가
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
            <div className="text-error">{error}</div>
          </div>
        )}

        {/* 게시글 목록 */}
        {!loading && !error && boards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400">등록된 게시글이 없습니다.</div>
          </div>
        )}

        {!loading && !error && boards.length > 0 && (
          <div className="space-y-4">
            {boards.map((board) => (
              <div
                key={board.pId}
                className="block bg-surface-dark border border-border-light rounded-xl p-6
                  transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 제목 */}
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-text-light">
                        {board.pTitle}
                      </h2>
                      {board.pIsPopup && (
                        <span className="text-xs bg-error text-white px-2 py-1 rounded">
                          팝업
                        </span>
                      )}
                      {!board.pSetVisible && (
                        <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">
                          숨김
                        </span>
                      )}
                    </div>

                    {/* 메타 정보 */}
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      <span>작성자: {board.trainerName}</span>
                      <span>•</span>
                      <span>{new Date(board.pCreateDate).toLocaleDateString('ko-KR')}</span>
                      <span>•</span>
                      <span>조회 {board.viewCount}</span>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/boards/${typeAddressName}/${board.pId}/edit`}
                        className="px-4 py-2 bg-surface-light text-text-light rounded-md
                          hover:bg-primary/20 transition-colors text-sm"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(board.pId, board.pTitle)}
                        className="px-4 py-2 bg-surface-light text-error rounded-md
                          hover:bg-error/20 transition-colors text-sm"
                      >
                        삭제
                      </button>
                      <Link
                        to={`/boards/${typeAddressName}/${board.pId}`}
                        className="px-4 py-2 bg-surface-light text-text-light rounded-md
                          hover:bg-primary/20 transition-colors text-sm"
                      >
                        미리보기
                      </Link>
                    </div>
                  </div>

                  {/* 썸네일 이미지 (있는 경우) */}
                  {board.pImageUrl && (
                    <div className="ml-4 flex-shrink-0">
                      <img
                        src={board.pImageUrl}
                        alt={board.pTitle}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
