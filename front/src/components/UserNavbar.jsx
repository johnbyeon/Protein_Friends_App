const UserNavbar = () => {
    return (
        <>
            <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-gray-400">
                    <a href="/access" className="hover:underline mr-3">출입체크</a>
                </button>
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black border border-border-dark 
                              rounded-md shadow-lg z-10 opacity-0 scale-95 transform transition-all duration-200 ease-out origin-top"
                >
                </div>
            </div>
            <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-gray-400">
                    <span className="hover:underline">게시판</span>
                    <span className="material-symbols-outlined text-base transition-transform group-hover:rotate-180 group-hover:text-text-light">expand_more</span>
                </button>
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black border border-border-dark 
                              rounded-md shadow-lg z-10 opacity-0 scale-95 group-hover:opacity-80 group-hover:scale-100 
                              group-hover:block transform transition-all duration-200 ease-out origin-top"
                >
                    <a href="/notice" className="block px-4 py-2 text-sm hover:bg-primary/20">공지사항</a>
                    <a href="/events" className="block px-4 py-2 text-sm hover:bg-primary/20">이벤트</a>
                    <a href="/benefits" className="block px-4 py-2 text-sm hover:bg-primary/20">혜택</a>
                </div>
            </div>



            <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-gray-400">
                    <span className="hover:underline hover:text-text-light duration-200 mr-3">SHOP</span>
                    <span class="material-symbols-outlined text-base transition-transform group-hover:rotate-180 group-hover:text-text-light">expand_more</span>
                </button>
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black border border-border-dark 
                      rounded-md shadow-lg z-10 opacity-0 scale-95 group-hover:opacity-80 group-hover:scale-100 
                      group-hover:block transform transition-all duration-200 ease-out origin-top"
                >
                    <a href="/shop" className="block px-4 py-2 text-sm hover:bg-primary/20">상품보기</a>
                    <a href="/shop/cart" className="block px-4 py-2 text-sm hover:bg-primary/20">장바구니</a>
                    <a href="/memberships" className="block px-4 py-2 text-sm hover:bg-primary/20">기간제 회원권 구매</a>
                    <a href="/pt-passes" className="block px-4 py-2 text-sm hover:bg-primary/20">PT 이용권 구매</a>

                </div>
            </div>

             <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-gray-400">
                    <a href="/trainers"  className="hover:underline hover:text-text-light mr-3">트레이너</a>
                </button>
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black border border-border-dark 
                              rounded-md shadow-lg z-10 opacity-0 scale-95 transform transition-all duration-200 ease-out origin-top"
                >
                </div>
            </div>
             <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-gray-400">
                    <a href="/branches" className="hover:underline hover:text-text-light mr-3">지점 정보</a>
                </button>
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black border border-border-dark 
                              rounded-md shadow-lg z-10 opacity-0 scale-95 transform transition-all duration-200 ease-out origin-top"
                >
                </div>
            </div>

            <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-gray-400">
                    <span  className="hover:underline hover:text-text-light mr-3">식단관리</span>
                    <span class="material-symbols-outlined text-base transition-transform group-hover:rotate-180 group-hover:text-text-light">expand_more</span>
                </button>
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black border border-border-dark 
                      rounded-md shadow-lg z-10 opacity-0 scale-95 group-hover:opacity-80 group-hover:scale-100 
                      group-hover:block transform transition-all duration-200 ease-out origin-top"
                >
                    <a href="/diet/plans" className="block px-4 py-2 text-sm hover:bg-primary/20">내 식단관리</a>
                    <a href="/calories" className="block px-4 py-2 text-sm hover:bg-primary/20">칼로리표 </a>
                </div>
            </div>

            <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-gray-400">
                    <span className="hover:underline hover:text-text-light mr-3">PT 클래스</span>
                    <span class="material-symbols-outlined text-base transition-transform group-hover:rotate-180">expand_more</span>
                </button>
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black border border-border-dark 
                      rounded-md shadow-lg z-10 opacity-0 scale-95 group-hover:opacity-80 group-hover:scale-100 
                      group-hover:block transform transition-all duration-200 ease-out origin-top"
                >
                    <a href="/classes/show" className="block px-4 py-2 text-sm hover:bg-primary/20">클래스 신청하기</a>
                    <a href="/classes/me" className="block px-4 py-2 text-sm hover:bg-primary/20">내 클래스보기</a>
                </div>
            </div>
            
            <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-gray-400">
                    <span className="hover:underline hover:text-text-light mr-3">내 정보관리</span>
                    <span class="material-symbols-outlined text-base transition-transform group-hover:rotate-180">expand_more</span>
                </button>
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black border border-border-dark 
                      rounded-md shadow-lg z-10 opacity-0 scale-95 group-hover:opacity-80 group-hover:scale-100 
                      group-hover:block transform transition-all duration-200 ease-out origin-top"
                >
                    <a href="/my/info" className="block px-4 py-2 text-sm hover:bg-primary/20">정보보기</a>
                    <a href="/my/memberships" className="block px-4 py-2 text-sm hover:bg-primary/20">내 회원권 보기</a>
                    <a href="/my/pt-passes" className="block px-4 py-2 text-sm hover:bg-primary/20">PT횟수 이용권 보기</a>
                    <a href="/my/coupons" className="block px-4 py-2 text-sm hover:bg-primary/20">할인권 보기</a>
                    <a href="my/inbody" className="block px-4 py-2 text-sm hover:bg-primary/20">인바디 데이터</a>
                </div>
            </div>

            <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-gray-400">
                    <span className="hover:underline hover:text-text-light mr-3">고객센터</span>
                    <span className="material-symbols-outlined text-base transition-transform group-hover:rotate-180">expand_more</span>
                </button>
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black border border-border-dark 
                              rounded-md shadow-lg z-10 opacity-0 scale-95 group-hover:opacity-80 group-hover:scale-100 
                              group-hover:block transform transition-all duration-200 ease-out origin-top"
                >
                    <a href="/support/inquiries" className="block px-4 py-2 text-sm hover:bg-primary/20">1:1문의</a>
                    <a href="/support/faqs" className="block px-4 py-2 text-sm hover:bg-primary/20">자주하는질문</a>
                </div>
            </div>
        </>

    )
}


export default UserNavbar;