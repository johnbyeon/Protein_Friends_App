import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBoardTypeStore } from '../../stores/boardTypeStore'

const UserNavbar = () => {
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
                    <Link to="/access" className="group-hover:underline group-hover:text-text-light mr-3">출입체크</Link>
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
                    {loading ? (
                        <div className="px-4 py-2 text-lg text-gray-400">
                            게시판 로딩 중...
                        </div>
                    ) : boardTypes.length > 0 ? (
                        boardTypes.map((type) => (
                            <Link
                                key={type.ptypeid}
                                to={`/boards/${type.ptypeaddressName}`}
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



            <div className="relative group">
                <button className="flex items-center gap-1 text-lg font-medium text-gray-400">
                    <span className="group-hover:underline group-hover:text-text-light duration-200 mr-3">SHOP</span>
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:rotate-180 group-hover:text-text-light">expand_more</span>
                </button>
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black border border-border-dark 
                      rounded-md shadow-lg z-10 opacity-0 scale-95 pointer-events-none group-hover:pointer-events-auto
                      group-hover:opacity-80 group-hover:scale-100 group-hover:block transform transition-all duration-200 ease-out origin-top
                      before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:block"
                >
                    <Link to="/shop" className="block px-4 py-2 text-lg hover:bg-primary/20">상품보기</Link>
                    <Link to="/shop/cart" className="block px-4 py-2 text-lg hover:bg-primary/20">장바구니</Link>
                    <Link to="/memberships" className="block px-4 py-2 text-lg hover:bg-primary/20">기간제 회원권 구매</Link>
                    <Link to="/pt-passes" className="block px-4 py-2 text-lg hover:bg-primary/20">PT 이용권 구매</Link>

                </div>
            </div>

             <div className="relative group">
                <button className="flex items-center gap-1 text-lg font-medium text-gray-400">
                    <Link to="/trainers" className="group-hover:underline group-hover:text-text-light mr-3">트레이너</Link>
                </button>

            </div>
             <div className="relative group">
                <button className="flex items-center gap-1 text-lg font-medium text-gray-400">
                    <Link to="/branches" className="group-hover:underline group-hover:text-text-light mr-3">지점 정보</Link>
                </button>
            </div>

            <div className="relative group">
                <button className="flex items-center gap-1 text-lg font-medium text-gray-400">
                    <span  className="group-hover:underline group-hover:text-text-light mr-3">식단관리</span>
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:rotate-180 group-hover:text-text-light">expand_more</span>
                </button>
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black border border-border-dark 
                      rounded-md shadow-lg z-10 opacity-0 scale-95 pointer-events-none group-hover:pointer-events-auto
                      group-hover:opacity-80 group-hover:scale-100 group-hover:block transform transition-all duration-200 ease-out origin-top
                      before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:block"
                >
                    <Link to="/diet/plans" className="block px-4 py-2 text-lg hover:bg-primary/20">내 식단관리</Link>
                    <Link to="/calories" className="block px-4 py-2 text-lg hover:bg-primary/20">칼로리표 </Link>
                </div>
            </div>

            <div className="relative group">
                <button className="flex items-center gap-1 text-lg font-medium text-gray-400">
                    <span className="group-hover:underline group-hover:text-text-light mr-3">PT 클래스</span>
                    <span className="material-symbols-outlined text-lg group-hover:text-text-light transition-transform group-hover:rotate-180">expand_more</span>
                </button>
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black border border-border-dark 
                      rounded-md shadow-lg z-10 opacity-0 scale-95 pointer-events-none group-hover:pointer-events-auto
                      group-hover:opacity-80 group-hover:scale-100 group-hover:block transform transition-all duration-200 ease-out origin-top
                      before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:block"
                >
                    <Link to="/classes/show" className="block px-4 py-2 text-lg hover:bg-primary/20">클래스 신청하기</Link>
                    <Link to="/classes/me" className="block px-4 py-2 text-lg hover:bg-primary/20">내 클래스보기</Link>
                </div>
            </div>

            <div className="relative group">
                <button className="flex items-center gap-1 text-lg font-medium text-gray-400">
                    <span className="group-hover:underline group-hover:text-text-light mr-3">고객센터</span>
                    <span className="material-symbols-outlined text-lg group-hover:text-text-light transition-transform group-hover:rotate-180">expand_more</span>
                </button>
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black border border-border-dark 
                              rounded-md shadow-lg z-10 opacity-0 scale-95 pointer-events-none group-hover:pointer-events-auto
                              group-hover:opacity-80 group-hover:scale-100 group-hover:block transform transition-all duration-200 ease-out origin-top
                              before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:block"
                >
                    <Link to="/support/inquiries" className="block px-4 py-2 text-lg hover:bg-primary/20">1:1문의</Link>
                    <Link to="/support/faqs" className="block px-4 py-2 text-lg hover:bg-primary/20">자주하는질문</Link>
                </div>
            </div>
        </>

    )
}


export default UserNavbar;