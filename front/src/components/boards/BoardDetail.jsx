import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

/**
 * 게시글 상세 페이지
 * - URL 파라미터: /boards/:typeAddressName/:pId
 */
export default function BoardDetail() {
  const { typeAddressName, pId } = useParams()
  const navigate = useNavigate()

  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 게시글 상세 정보 불러오기
  useEffect(() => {
    // pId가 없거나 undefined면 실행하지 않음
    if (!pId || pId === 'undefined') {
      setError('잘못된 게시글 ID입니다.')
      setLoading(false)
      return
    }

    const loadBoard = async () => {
      setLoading(true)
      setError(null)

      try {
        const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
        const token = localStorage.getItem('jwt')

        const headers = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${SERVER_ORIGIN}/api/boards/${pId}`, {
          headers
        })

        if (response.status === 401) {
          // 인증 필요 - 로그인 페이지로 리디렉션
          console.log('인증이 필요합니다. 로그인 페이지로 이동합니다.')
          navigate('/login')
          return
        }

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('게시글을 찾을 수 없습니다.')
          }
          throw new Error('게시글을 불러오는데 실패했습니다.')
        }

        const data = await response.json()
        setBoard(data)

        // 조회수 기록 (비동기로 따로 처리)
        recordView()
      } catch (err) {
        console.error('게시글 조회 에러:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadBoard()
  }, [pId, navigate])

  // 조회수 기록
  const recordView = async () => {
    try {
      const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
      const token = localStorage.getItem('jwt')

      console.log('🔍 [BoardDetail] recordView 시작')
      console.log('🔍 [BoardDetail] pId:', pId)
      console.log('🔍 [BoardDetail] token exists:', !!token)
      console.log('🔍 [BoardDetail] token:', token?.substring(0, 20) + '...')

      if (!token) {
        console.log('❌ [BoardDetail] 조회수 기록 스킵: 로그인하지 않음')
        return
      }

      const response = await fetch(`${SERVER_ORIGIN}/api/boards/${pId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('🔍 [BoardDetail] 조회수 기록 응답:', response.status)
      console.log('🔍 [BoardDetail] 조회수 기록 ok:', response.ok)

      if (response.ok) {
        console.log('✅ [BoardDetail] 조회수 기록 완료')
      } else {
        console.log('❌ [BoardDetail] 조회수 기록 실패:', response.statusText)
        const errorText = await response.text()
        console.log('❌ [BoardDetail] 에러 내용:', errorText)
      }
    } catch (err) {
      // 조회수 기록 실패해도 게시글 조회에는 영향 없음
      console.error('조회수 기록 실패:', err)
    }
  }

  // 목록으로 돌아가기
  const handleBackToList = () => {
    navigate(`/boards/${typeAddressName}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-gray-400">게시글을 불러오는 중...</div>
      </div>
    )
  }

  if (error || !board) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-center">
          <div className="text-error mb-4">{error || '게시글을 찾을 수 없습니다.'}</div>
          <button
            onClick={handleBackToList}
            className="text-primary hover:underline"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 목록으로 버튼 */}
        <div className="mb-6">
          <button
            onClick={handleBackToList}
            className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </button>
        </div>

        {/* 게시글 카드 */}
        <div className="bg-surface-dark border border-border-light rounded-xl p-8">
          {/* 헤더 */}
          <div className="border-b border-border-light pb-6 mb-6">
            {/* 타입 및 팝업 뱃지 */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm bg-primary/20 text-primary px-3 py-1 rounded">
                {board.pTypeName}
              </span>
              {board.pIsPopup && (
                <span className="text-sm bg-error text-white px-3 py-1 rounded">
                  팝업
                </span>
              )}
            </div>

            {/* 제목 */}
            <h1 className="text-3xl font-bold text-text-light mb-4">
              {board.pTitle}
            </h1>

            {/* 메타 정보 */}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>작성자: {board.trainerName}</span>
              <span>•</span>
              <span>{new Date(board.pCreateDate).toLocaleDateString('ko-KR')}</span>
              <span>•</span>
              <span>조회 {board.viewCount}</span>
              {board.pUpdateDate && board.pUpdateDate !== board.pCreateDate && (
                <>
                  <span>•</span>
                  <span>수정: {new Date(board.pUpdateDate).toLocaleDateString('ko-KR')}</span>
                </>
              )}
            </div>
          </div>

          {/* 이미지 (있는 경우) */}
          {board.pImageUrl && (
            <div className="mb-6">
              <img
                src={board.pImageUrl}
                alt={board.pTitle}
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* 내용 */}
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap mb-6">
            {board.pContent}
          </div>

          {/* 링크 (있는 경우) */}
          {board.pLink && (
            <div className="mt-6 pt-6 border-t border-border-light">
              <a
                href={board.pLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                관련 링크 바로가기
              </a>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleBackToList}
            className="px-6 py-3 bg-surface-dark border border-primary/20 text-text-light rounded-lg
              hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10
              transition-all duration-300"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}
