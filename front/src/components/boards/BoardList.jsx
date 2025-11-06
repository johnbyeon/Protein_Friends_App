import { useEffect, useState, useRef } from 'react'
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
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [showPostPopup, setShowPostPopup] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // 게시글 타입 정보 찾기
  useEffect(() => {
    const loadBoardTypes = async () => {
      console.log('🔍 [BoardList] loadBoardTypes 호출됨')
      console.log('🔍 [BoardList] 현재 boardTypes 길이:', boardTypes.length)
      
      if (boardTypes.length === 0) {
        console.log('🔍 [BoardList] fetchBoardTypes 호출')
        await fetchBoardTypes()
        console.log('🔍 [BoardList] fetchBoardTypes 완료 후 boardTypes:', boardTypes)
      }
    }
    loadBoardTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardTypes.length])

  // 현재 타입 설정
  useEffect(() => {
    console.log('🔍 [BoardList] useEffect 호출됨')
    console.log('🔍 [BoardList] boardTypes:', boardTypes)
    console.log('🔍 [BoardList] typeAddressName:', typeAddressName)
    
    if (boardTypes.length > 0 && typeAddressName) {
      const type = boardTypes.find(t => 
        t.pTypeAddressName === typeAddressName || t.ptypeaddressName === typeAddressName
      )
      console.log('🔍 [BoardList] 찾은 타입:', type)
      setCurrentType(type)
    } else {
      console.log('🔍 [BoardList] boardTypes가 없거나 typeAddressName이 없음')
    }
  }, [boardTypes, typeAddressName])

  // 디바운싱을 위한 ref
  const fetchTimeoutRef = useRef(null)

  // 게시글 목록 불러오기 함수 (디바운싱 적용)
  const fetchBoards = async () => {
    if (!currentType) return

    // 이전 타이머 취소
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
    }

    // 300ms 디바운싱
    fetchTimeoutRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
        const token = localStorage.getItem('jwt')

        const headers = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const typeId = currentType.pTypeId || currentType.ptypeid
        console.log('🔍 [BoardList] API 호출 - typeId:', typeId)
        console.log('🔍 [BoardList] API 호출 - currentType:', currentType)
        
        const response = await fetch(`${SERVER_ORIGIN}/api/boards/type/${typeId}`, {
          headers
        })

        console.log('🔍 [BoardList] API 응답 상태:', response.status)

        if (response.status === 401) {
          console.log('인증이 필요합니다. 로그인 페이지로 이동합니다.')
          navigate('/login')
          return
        }

        if (!response.ok) {
          console.error('🔍 [BoardList] API 응답 에러:', response.statusText)
          throw new Error('게시글 목록을 불러오는데 실패했습니다.')
        }

        const data = await response.json()
        console.log('🔍 [BoardList] API 응답 데이터:', data)
        setBoards(data)
      } catch (err) {
        console.error('게시글 목록 조회 에러:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  // 게시글 목록 불러오기 useEffect
  useEffect(() => {
    fetchBoards()
  }, [currentType, navigate])

  // 검색 필터링
  const filteredBoards = boards.filter(board => {
    if (!searchKeyword) return true
    const title = (board.ptitle || board.pTitle || '').toLowerCase()
    const content = (board.pcontent || board.pContent || '').toLowerCase()
    return title.includes(searchKeyword.toLowerCase()) || content.includes(searchKeyword.toLowerCase())
  })

  // 게시글 클릭 핸들러 - 상세 API 호출
  const handlePostClick = async (board) => {
    try {
      const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
      const token = localStorage.getItem('jwt')

      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${SERVER_ORIGIN}/api/boards/${board.pid || board.pId}`, {
        headers
      })

      if (response.status === 401) {
        console.log('인증이 필요합니다. 로그인 페이지로 이동합니다.')
        navigate('/login')
        return
      }

      if (!response.ok) {
        throw new Error('게시글 상세 정보를 불러오는데 실패했습니다.')
      }

      const data = await response.json()
      setSelectedPost(data)
      setShowPostPopup(true)
      
      // GET 요청으로 이미 조회수가 기록되었으므로 목록만 새로고침
      setTimeout(() => {
        fetchBoards()
      }, 500) // 0.5초 후에 새로고침하여 DB 반영 시간 확보
      
    } catch (err) {
      console.error('게시글 상세 조회 에러:', err)
      alert('게시글을 불러오는데 실패했습니다.')
    }
  }

  // 아이콘 매핑
  const getIconForType = (typeName) => {
    if (!typeName) return 'article'
    if (typeName.includes('공지')) return 'campaign'
    if (typeName.includes('이벤트')) return 'celebration'
    if (typeName.includes('혜택')) return 'redeem'
    return 'article'
  }

  if (!currentType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-gray-400">게시판 타입을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen w-full bg-background-dark p-10">
        {/* 헤더 + 검색 */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-4xl font-bold tracking-tight text-white">
            {currentType.pTypeName}
          </h2>
          <div className="flex flex-1 items-center gap-4 md:flex-initial">
            <div className="relative w-full max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                className="w-full rounded-md border-primary/30 bg-black/20 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="제목 또는 내용 검색"
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>
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

        {/* 게시글 테이블 */}
        {!loading && !error && filteredBoards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400">
              {searchKeyword ? '검색 결과가 없습니다.' : '등록된 게시글이 없습니다.'}
            </div>
          </div>
        )}

        {!loading && !error && filteredBoards.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-lg border border-primary/20">
              <table className="min-w-full divide-y divide-primary/20">
                <thead className="bg-primary/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary" scope="col">
                      번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary" scope="col">
                      사진
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary" scope="col">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary" scope="col">
                      작성자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary" scope="col">
                      조회수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary" scope="col">
                      작성일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary" scope="col">
                      수정일
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-black/20">
                   {filteredBoards.map((board, index) => {
                      const createDate = new Date(board.pcreateDate || board.pCreateDate).toLocaleDateString('ko-KR')
                      const updateDate = new Date(board.pupdateDate || board.pUpdateDate).toLocaleDateString('ko-KR')
                      const isModified = createDate !== updateDate
                      console.log('board:', JSON.stringify(board))
                      return (
                        <tr
                          key={board.pid || board.pId}
                          onClick={() => handlePostClick(board)}
                          className="cursor-pointer hover:bg-primary/5"
                        >
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-300">
                            {filteredBoards.length - index}
                          </td>
                          <td className="px-6 py-4">
                            {(board.pimageUrl || board.pImageUrl) ? (
                              <img
                                alt={board.ptitle || board.pTitle}
                                className="h-16 w-16 rounded-md object-cover"
                                src={board.pimageUrl || board.pImageUrl}
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-md bg-gray-700 flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-500">image</span>
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-white">
                            {board.ptitle || board.pTitle}
                            {(board.pisPopup || board.pIsPopup) && (
                              <span className="ml-2 text-xs bg-error text-white px-2 py-1 rounded">팝업</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-white">
                            {board.trainerName || '관리자'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300 text-center">
                            {board.viewCount || 0}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                            {createDate}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                            {updateDate}
                            {isModified && (
                              <span className="ml-2 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                                수정됨
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 (향후 구현) */}
            {/* <div className="mt-6 flex items-center justify-center">
              <nav aria-label="Pagination" className="inline-flex -space-x-px rounded-md shadow-sm">
                ...
              </nav>
            </div> */}
          </>
        )}
      </div>

      {/* 게시글 상세 모달 팝업 */}
      {showPostPopup && selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center  justify-center bg-black/80"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPostPopup(false)
          }}
        >
          <div className="relative w-full max-w-3xl rounded-xl ring-1 ring-primary/30 bg-background-dark text-white shadow-2xl">
            <button
              onClick={() => setShowPostPopup(false)}
              className="absolute -top-4 -right-4 z-20 rounded-full w-10 h-10 bg-primary p-2 text-background-dark transition-opacity hover:opacity-80"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="max-h-[80vh] overflow-y-auto custom-scrollbar p-10">
              <h2 className="mb-4 text-3xl font-bold text-primary">
                {selectedPost.ptitle || selectedPost.pTitle}
              </h2>
              <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                <p>
                  작성자: <span className="font-medium text-white">{selectedPost.trainerName || '관리자'}</span>
                </p>
                <span>|</span>
                <p>
                  조회수: <span className="font-medium text-white">{selectedPost.viewCount || 0}</span>
                </p>
                <span>|</span>
                <p>
                  작성일: <span className="font-medium text-white">
                    {new Date(selectedPost.pcreateDate || selectedPost.pCreateDate).toLocaleDateString('ko-KR')}
                  </span>
                </p>
                {new Date(selectedPost.pcreateDate || selectedPost.pCreateDate).toLocaleDateString('ko-KR') !==
                  new Date(selectedPost.pupdateDate || selectedPost.pUpdateDate).toLocaleDateString('ko-KR') && (
                  <>
                    <span>|</span>
                    <p>
                      수정일: <span className="font-medium text-white">
                        {new Date(selectedPost.pupdateDate || selectedPost.pUpdateDate).toLocaleDateString('ko-KR')}
                      </span>
                    </p>
                  </>
                )}
              </div>
              <div className="prose prose-invert max-w-none text-gray-300">
                {(selectedPost.pimageUrl || selectedPost.pImageUrl) && (
                  <img
                    alt={selectedPost.ptitle || selectedPost.pTitle}
                    src={selectedPost.pimageUrl || selectedPost.pImageUrl}
                    className="mb-6 h-auto w-full rounded-lg object-cover"
                  />
                )}
                <p className="whitespace-pre-wrap">{selectedPost.pcontent || selectedPost.pContent}</p>
              </div>
            </div>
            <div className="flex justify-end gap-4 rounded-b-xl bg-background-dark/50 p-4">
              <button
                onClick={() => setShowPostPopup(false)}
                className="rounded-lg bg-primary/20 px-6 py-2 font-semibold text-primary transition-colors hover:bg-primary/30"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
