import { useLocation, Link } from 'react-router-dom'
import { useBoardTypeStore } from '../stores/boardTypeStore'
import { menuConfig, getMenuCategoryFromPath } from '../config/menuConfig'
import { useEffect } from 'react'

/**
 * 왼쪽 사이드바 컴포넌트
 * - 현재 경로에 따라 해당하는 메뉴 카테고리의 하위 항목들을 표시
 * - 홈 페이지에서는 표시되지 않음
 */
const LeftSidebar = () => {
    const location = useLocation()
    const { boardTypes, fetchBoardTypes } = useBoardTypeStore()

    // 게시판 타입 로드
    useEffect(() => {
                console.log("보더타입정보 "+JSON.stringify(boardTypes, null, 2))
        if (boardTypes.length === 0) {
            fetchBoardTypes()
        }
    }, [boardTypes.length, fetchBoardTypes])

    // 현재 경로로부터 메뉴 카테고리 파악
    const category = getMenuCategoryFromPath(location.pathname)

    // 카테고리가 없으면 사이드바 표시 안 함 (홈 등)
    if (!category) {
        return null
    }

    // 해당 카테고리의 메뉴 설정 가져오기
    let menuData = menuConfig[category]

    // 게시판인 경우 동적으로 메뉴 생성
    if (category === 'boards' && boardTypes.length > 0) {

        menuData = {
            ...menuConfig.boards,
            items: boardTypes.map(type => (
                
                {
                label: type.ptypename,
                path: `/boards/${type.ptypeaddressName}`,
                icon: 'article'
            }))
        }
    }

    // 메뉴 데이터가 없으면 사이드바 표시 안 함
    if (!menuData || !menuData.items || menuData.items.length === 0) {
        return null
    }

    // 현재 활성화된 메뉴 확인 (경로 매칭)
    const isActive = (path) => {
        // 동적 경로 처리 (예: /admin/members/:id)
        if (path.includes(':')) {
            const pathPattern = path.split('/').slice(0, -1).join('/')
            return location.pathname.startsWith(pathPattern)
        }
        return location.pathname === path || location.pathname.startsWith(path + '/')
    }

    return (
        <aside className="w-64 bg-background-dark text-white border-r border-primary/20 flex-shrink-0">
            {/* 헤더 */}
            <div className="border-b border-primary/20 p-6 text-center">
                <div className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">
                        {menuData.icon}
                    </span>
                    <h1 className="text-2xl font-bold text-primary">{menuData.title}</h1>
                </div>
            </div>

            {/* 메뉴 항목들 */}
            <nav className="flex-1 space-y-1 p-4">
                {menuData.items.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className={`flex items-center rounded-lg px-4 py-2 transition-colors ${
                            isActive(item.path)
                                ? 'font-semibold text-primary bg-primary/10'
                                : 'text-gray-300 hover:bg-primary/10 hover:text-primary'
                        }`}
                    >
                        <span className="material-symbols-outlined mr-3">{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    )
}

export default LeftSidebar

