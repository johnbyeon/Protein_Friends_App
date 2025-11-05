import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useBoardTypeStore } from '../../stores/boardTypeStore'

/**
 * 게시판 목록 페이지 (공통 컴포넌트)
 * - URL 파라미터로 게시글 타입 구분
 * - 예: /boards/notices, /boards/events, /boards/benefits
 */
export default function BoardList() {
  const { typeAddressName } = useParams() // URL에서 타입 주소 가져오기
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

  // 게시글 목록 불러오기
  useEffect(() => {
    const loadBoards = async () => {
      if (!currentType) return

      setLoading(true)
      setError(null)

      try {
        const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
        const token = localStorage.getItem('jwt')

        const headers = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${SERVER_ORIGIN}/api/boards/type/${currentType.ptypeid}`, {
          headers
        })

        if (response.status === 401) {
          // 인증 필요 - 로그인 페이지로 리디렉션
          console.log('인증이 필요합니다. 로그인 페이지로 이동합니다.')
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
  }, [currentType])

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
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-light mb-2">
            {currentType.ptypename}
          </h1>
          <div className="h-1 w-20 bg-primary rounded"></div>
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
              <Link
                key={board.pId}
                to={`/boards/${typeAddressName}/${board.pId}`}
                className="block bg-surface-dark border border-border-light rounded-xl p-6
                  hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10
                  transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 제목 */}
                    <h2 className="text-xl font-semibold text-text-light mb-2 hover:text-primary transition-colors">
                      {board.pTitle}
                      {board.pIsPopup && (
                        <span className="ml-2 text-xs bg-error text-white px-2 py-1 rounded">
                          팝업
                        </span>
                      )}
                    </h2>

                    {/* 메타 정보 */}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>작성자: {board.trainerName}</span>
                      <span>•</span>
                      <span>{new Date(board.pCreateDate).toLocaleDateString('ko-KR')}</span>
                      <span>•</span>
                      <span>조회 {board.viewCount}</span>
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
