import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBoardTypeStore } from '../../stores/boardTypeStore'

const AdminNavbar = () => {
    const { boardTypes, fetchBoardTypes } = useBoardTypeStore()
    const [loading, setLoading] = useState(true)

    // 게시글 타입 목록 로드
    useEffect(() => {
        const loadBoardTypes = async () => {
            if (boardTypes.length === 0) {
                await fetchBoardTypes()
            }
            setLoading(false)
        }
        loadBoardTypes()
    }, [boardTypes.length, fetchBoardTypes])

    return (
        <>
            <div className="relative group">
                <button className="flex items-center gap-1 text-lg font-medium text-gray-400">
                    <Link to="/admin/dashboard" className="group-hover:underline group-hover:text-text-light mr-3">관리자 대시보드</Link>
                </button>
            </div>
            
            <div className="relative group">
                <button className="flex items-center gap-1 text-lg font-medium text-gray-400">
                    <span className="group-hover:underline group-hover:text-text-light mr-3">게시판</span>
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:rotate-180 group-hover:text-text-light">expand_more</span>
                </button>
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black border border-border-dark 
                              rounded-md shadow-lg z-10 opacity-0 scale-95 pointer-events-none group-hover:pointer-events-auto
                              group-hover:opacity-80 group-hover:scale-100 group-hover:block transform transition-all duration-200 ease-out origin-top
                              before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:block"
                >
                    <Link 
                        to="/admin/board-types" 
                        className="block px-4 py-2 text-lg hover:bg-primary/20 border-b border-border-dark"
                    >
                        게시판타입설정
                    </Link>
                    {loading ? (
                        <div className="px-4 py-2 text-lg text-gray-400">
                            게시판 로딩 중...
                        </div>
                    ) : boardTypes.length > 0 ? (
                        boardTypes.map((type) => (
                            <Link
                                key={type.ptypeid}
                                to={`/admin/boards/${type.ptypeaddressName}`}
                                className="block px-4 py-2 text-lg hover:bg-primary/20"
                            >
                                {type.ptypename}
                            </Link>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-lg text-gray-400">
                            게시판 없음
                        </div>
                    )}
                </div>
            </div>

        </>

    )
}


export default AdminNavbar;