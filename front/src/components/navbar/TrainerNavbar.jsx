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

const TrainerNavbar = () => {
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
                to: `/trainer/boards/${item.slug}`,
            }))
        }

        return boardTypes.map((type) => ({
            label: type.pTypeName || type.ptypename,
            to: `/trainer/boards/${type.pTypeAddressName || type.ptypeaddressName}`,
        }))
    }, [boardTypes, loading])

    const trainerDropdownMenus = [
        {
            label: '게시판관리',
            items: [
                { label: '게시글 타입 설정', to: '/trainer/board-types' },
                ...boardEntries,
            ],
        },
        {
            label: '고객센터',
            items: [
                { label: '1:1 문의 관리', to: '/trainer/support/inquiries' },
                { label: '자주하는 질문', to: '/trainer/support/faqs' },
            ],
        },
        {
            label: '마켓관리',
            items: [
                { label: 'PT 이용권 관리', to: '/trainer/market/pt-tickets' },
                { label: '기간제 회원권 관리', to: '/trainer/market/memberships' },
            ],
        },

        {
            label: '현장판매',
            items: [
                { label: '기간제 회원권 판매', to: '/trainer/pos/membership' },
                { label: 'PT 이용권 판매', to: '/trainer/pos/pt-pass' },
            ],
        },

    ]

    return (
        <>
            <div className="relative group">
                <Link
                    to="/trainer/dashboard"
                    className="text-lg font-medium text-gray-400 group-hover:text-text-light group-hover:underline"
                >
                    홈
                </Link>
            </div>

            {trainerDropdownMenus.map((menu) => (
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
                            item.disabled ? (
                                <span key={item.label} className={disabledItemClass}>
                                    {item.label} (준비중)
                                </span>
                            ) : (
                                <Link key={item.label} to={item.to} className={dropdownItemClass}>
                                    {item.label}
                                </Link>
                            )
                        )}
                    </div>
                </div>
            ))}
        </>
    )
}

export default TrainerNavbar
