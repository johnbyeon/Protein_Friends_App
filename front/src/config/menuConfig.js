/**
 * 왼쪽 사이드바 메뉴 구조 정의
 * - 각 최상위 메뉴별 하위 메뉴 구성
 */

export const menuConfig = {
    // 고객센터
    support: {
        title: '고객센터',
        icon: 'support_agent',
        items: [
            {
                label: '자주하는 질문',
                path: '/support/faqs',
                icon: 'help_center'
            },
            {
                label: '1:1 문의',
                path: '/support/inquiries',
                icon: 'mail'
            }
        ]
    },

    // 내 정보관리
    my: {
        title: '내 정보관리',
        icon: 'person',
        items: [
            {
                label: '정보보기',
                path: '/my/info',
                icon: 'badge'
            },
            {
                label: '내 회원권 보기',
                path: '/my/memberships',
                icon: 'card_membership'
            },
            {
                label: 'PT횟수 이용권 보기',
                path: '/my/pt-passes',
                icon: 'fitness_center'
            },
            {
                label: '할인권 보기',
                path: '/my/coupons',
                icon: 'local_offer'
            },
            {
                label: '인바디 데이터',
                path: '/my/inbody',
                icon: 'monitor_weight'
            }
        ]
    },

    // SHOP
    shop: {
        title: 'SHOP',
        icon: 'shopping_cart',
        items: [
            {
                label: '상품보기',
                path: '/shop',
                icon: 'store'
            },
            {
                label: '장바구니',
                path: '/shop/cart',
                icon: 'shopping_cart'
            },
            {
                label: '기간제 회원권 구매',
                path: '/memberships',
                icon: 'card_membership'
            },
            {
                label: 'PT 이용권 구매',
                path: '/pt-passes',
                icon: 'fitness_center'
            }
        ]
    },

    // 식단관리
    diet: {
        title: '식단관리',
        icon: 'restaurant',
        items: [
            {
                label: '내 식단관리',
                path: '/diet/plans',
                icon: 'restaurant_menu'
            },
            {
                label: '칼로리표',
                path: '/calories',
                icon: 'calculate'
            }
        ]
    },

    // PT 클래스
    classes: {
        title: 'PT 클래스',
        icon: 'fitness_center',
        items: [
            {
                label: '클래스 신청하기',
                path: '/classes/show',
                icon: 'event_available'
            },
            {
                label: '내 클래스보기',
                path: '/classes/me',
                icon: 'event_note'
            }
        ]
    },

    // 게시판 (동적으로 로드되지만 기본 구조)
    boards: {
        title: '게시판',
        icon: 'article',
        items: [] // boardTypeStore에서 동적으로 채워짐
    },

    // 관리자 - 고객센터
    'admin-support': {
        title: '고객센터',
        icon: 'support_agent',
        items: [
            {
                label: 'FAQ 관리',
                path: '/admin/support/faqs',
                icon: 'help_center'
            },
            {
                label: '1:1 문의 관리',
                path: '/admin/support/inquiries',
                icon: 'mail'
            }
        ]
    },

    // 관리자 - 회원 관리
    'admin-members': {
        title: '회원 관리',
        icon: 'people',
        items: [
            {
                label: '회원 목록',
                path: '/admin/members',
                icon: 'list'
            },
            {
                label: '회원 상세',
                path: '/admin/members/:id',
                icon: 'person'
            }
        ]
    },

    // 관리자 - 게시판 관리
    'admin-boards': {
        title: '게시판 관리',
        icon: 'article',
        items: [
            {
                label: '게시글 관리',
                path: '/admin/boards',
                icon: 'list_alt'
            },
            {
                label: '게시판 타입 관리',
                path: '/admin/board-types',
                icon: 'category'
            }
        ]
    },

    // 관리자 - 트레이너 관리
    'admin-trainers': {
        title: '트레이너 관리',
        icon: 'fitness_center',
        items: [
            {
                label: '트레이너 등록',
                path: '/admin/trainers/new',
                icon: 'person_add'
            },
            {
                label: '트레이너 목록',
                path: '/admin/trainers',
                icon: 'list'
            }
        ]
    },

    // 트레이너 - 고객센터
    'trainer-support': {
        title: '고객센터',
        icon: 'support_agent',
        items: [
            {
                label: 'FAQ 관리',
                path: '/trainer/support/faqs',
                icon: 'help_center'
            },
            {
                label: '1:1 문의 관리',
                path: '/trainer/support/inquiries',
                icon: 'mail'
            }
        ]
    }
}

/**
 * URL 경로로부터 현재 메뉴 카테고리 파악
 * @param {string} pathname - 현재 URL 경로
 * @returns {string|null} - 메뉴 카테고리 키
 */
export function getMenuCategoryFromPath(pathname) {
    // 홈은 null 반환 (사이드바 표시 안 함)
    if (pathname === '/home' || pathname === '/') {
        return null
    }

    // Admin 경로 처리
    if (pathname.startsWith('/admin/support')) {
        return 'admin-support'
    }
    if (pathname.startsWith('/admin/members')) {
        return 'admin-members'
    }
    if (pathname.startsWith('/admin/boards') || pathname.startsWith('/admin/board-types')) {
        return 'admin-boards'
    }
    if (pathname.startsWith('/admin/trainers')) {
        return 'admin-trainers'
    }

    // Trainer 경로 처리
    if (pathname.startsWith('/trainer/support')) {
        return 'trainer-support'
    }

    // User 경로 처리
    if (pathname.startsWith('/support')) {
        return 'support'
    }
    if (pathname.startsWith('/my')) {
        return 'my'
    }
    if (pathname.startsWith('/shop') || pathname.startsWith('/memberships') || pathname.startsWith('/pt-passes')) {
        return 'shop'
    }
    if (pathname.startsWith('/diet') || pathname.startsWith('/calories')) {
        return 'diet'
    }
    if (pathname.startsWith('/classes')) {
        return 'classes'
    }
    if (pathname.startsWith('/boards')) {
        return 'boards'
    }

    // 매칭되지 않으면 null
    return null
}

