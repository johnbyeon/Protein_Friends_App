import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBoardTypeStore } from '../../stores/boardTypeStore'

const DEFAULT_BOARD_TYPES = [
    { slug: 'notices', label: '공지사항' },
    { slug: 'events', label: '이벤트' },
    { slug: 'benefits', label: '혜택' },
]

const dropdownPanelClass =
    "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-black border border-border-dark rounded-md shadow-lg z-10 opacity-0 scale-95 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-80 group-hover:scale-100 transform transition-all duration-200 ease-out origin-top before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:block"

const dropdownItemClass =
    'block px-4 py-2 text-lg hover:bg-primary/20 border-b border-border-dark last:border-b-0 transition-colors duration-150'

const disabledItemClass =
    'block px-4 py-2 text-lg text-gray-500 border-b border-border-dark last:border-b-0 cursor-default'

const AdminNavbar = () => {
    const { boardTypes, fetchBoardTypes } = useBoardTypeStore()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadBoardTypes = async () => {
            if (boardTypes.length === 0) {
                await fetchBoardTypes()
            }
            setLoading(false)
        }

        loadBoardTypes()
    }, [boardTypes.length, fetchBoardTypes])

    const boardEntries = useMemo(() => {
        if (loading || boardTypes.length === 0) {
            return DEFAULT_BOARD_TYPES.map((item) => ({
                label: item.label,
                to: `/admin/boards/${item.slug}`,
            }))
        }

        return boardTypes.map((type) => ({
            label: type.ptypename,
            to: `/admin/boards/${type.ptypeaddressName}`,
        }))
    }, [boardTypes, loading])

    const adminDropdownMenus = [
        {
            label: '게시판관리',
            items: [
                { label: '게시글 타입 설정', to: '/admin/board-types' },
                ...boardEntries,
            ],
        },
        {
            label: '지점관리',
            items: [
                { label: '지점 등록', to: '/admin/centers/branches/new' },
                { label: '지점 목록', to: '/admin/centers/branches' },
            ],
        },
        {
            label: '고객센터',
            items: [
                { label: '1:1 문의 관리', to: '/admin/support/inquiries' },
                { label: '자주하는 질문 관리', to: '/admin/support/faqs' },
            ],
        },
        {
            label: '마켓관리',
            items: [
                { label: '상품 보기', to: '/admin/market/products' },
                { label: '상품 등록', to: '/admin/market/products/new' },
                { label: '주문 리스트', to: '/admin/market/orders' },
                { label: '할인권 관리', to: '/admin/market/coupons' },
                { label: 'PT 이용권 관리', to: '/admin/market/pt-passes' },
                { label: '기간제 회원권 관리', to: '/admin/market/memberships' },
            ],
        },
        {
            label: '매출관리',
            items: [{ label: '트레이너별 매출보기', to: '/admin/sales/trainers' }],
        },
        {
            label: '수업관리',
            items: [
                { label: '수업 시간표', to: '/admin/classes/schedule' },
                { label: '수업 신규등록', to: '/admin/classes/new' },
            ],
        },
        {
            label: '트레이너관리',
            items: [
                { label: '트레이너 목록', to: '/admin/trainers' },
                { label: '트레이너 신규등록', to: '/admin/trainers/new' },
            ],
        },
        {
            label: '현장판매',
            items: [
                { label: '기간제 회원권 판매', to: '/admin/pos/membership' },
                { label: 'PT 이용권 판매', to: '/admin/pos/pt-pass' },
            ],
        },
        {
            label: '회원관리',
            items: [
                { label: '회원 리스트', to: '/admin/members' },
                { label: '할인권 배포', to: '/admin/discounts/distribute' },
            ],
        },
    ]

    return (
        <>
            <div className="relative group">
                <Link
                    to="/admin/dashboard"
                    className="text-lg font-medium text-gray-400 group-hover:text-text-light group-hover:underline"
                >
                    홈
                </Link>
            </div>

            {adminDropdownMenus.map((menu) => (
                <div className="relative group" key={menu.label}>
                    <button className="flex items-center gap-1 text-lg font-medium text-gray-400">
                        <span className="group-hover:underline group-hover:text-text-light mr-1">
                            {menu.label}
                        </span>
                        <span className="material-symbols-outlined text-lg transition-transform group-hover:rotate-180 group-hover:text-text-light">
                            expand_more
                        </span>
                    </button>
                    <div className={dropdownPanelClass}>
                        {menu.items.map((item) =>
                            item.to ? (
                                <Link key={item.label} to={item.to} className={dropdownItemClass}>
                                    {item.label}
                                </Link>
                            ) : (
                                <span key={item.label} className={disabledItemClass}>
                                    {item.label}
                                </span>
                            )
                        )}
                    </div>
                </div>
            ))}
        </>
    )
}

export default AdminNavbar
