import React from "react"
import { Link } from "react-router-dom"

export default function AdminDashboard() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark min-h-screen">
      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* 검색 영역 */}
        <div className="flex w-full items-center gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="회원 이름 또는 연락처를 입력하세요"
              className="w-full rounded-lg border border-border-light bg-surface-light px-4 py-3 pr-10 text-base placeholder:text-subtle-text-light focus:border-primary focus:ring-primary"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="material-symbols-outlined text-subtle-text-light">
                search
              </span>
            </div>
          </div>
          <button className="flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white">
            검색
          </button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "현재 회원 수", value: "1,234", diff: "+2.5%", up: true },
            { title: "신규 회원 (이번 달)", value: "82", diff: "+15%", up: true },
            { title: "활성 회원 (이번 주)", value: "452", diff: "-3%", up: false },
            { title: "만료 예정 (30일 내)", value: "58" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-lg p-6 bg-surface-light border border-border-light"
            >
              <p className="text-subtle-text-light text-base font-medium">{item.title}</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold">{item.value}</p>
                {item.diff && (
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      item.up ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    <span className="material-symbols-outlined !text-base">
                      {item.up ? "arrow_upward" : "arrow_downward"}
                    </span>
                    <span>{item.diff}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 차트 및 매출 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-3 flex flex-col gap-2 rounded-lg border border-border-light p-6 bg-surface-light">
            <p className="text-lg font-bold">주간 방문자 수 추이</p>
            <p className="text-[32px] font-bold leading-tight">1,050</p>
            <svg viewBox="-3 0 478 190" className="w-full h-48" fill="none">
              <path
                d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V189H0V109Z"
                fill="url(#paint0_linear_chart)"
              />
              <path
                d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                stroke="#DC2626"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="paint0_linear_chart" x1="236" x2="236" y1="1" y2="189">
                  <stop stopColor="#DC2626" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#DC2626" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4 rounded-lg border border-border-light p-6 bg-surface-light">
            <h3 className="text-lg font-bold">매출 현황</h3>
            <p className="text-xl font-bold text-primary">₩ 15,240,000</p>
            <p className="text-sm text-subtle-text-light">총 매출</p>
          </div>
        </div>

        {/* 관리자 메뉴 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col rounded-lg border border-border-light p-6 bg-surface-light">
            <h2 className="text-lg font-bold mb-4">게시판 관리</h2>
            <div className="space-y-2">
              <Link 
                to="/admin/board-types" 
                className="block px-4 py-2 bg-surface-light text-text-light rounded-md hover:bg-primary/20 transition-colors text-sm"
              >
                게시판 타입 관리
              </Link>
              <div className="text-xs text-gray-400 px-4">
                공지사항, 이벤트 등 게시판 종류 관리
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-border-light p-6 bg-surface-light">
            <h2 className="text-lg font-bold mb-4">회원 관리</h2>
            <div className="space-y-2">
              <button className="block w-full text-left px-4 py-2 bg-surface-light text-text-light rounded-md hover:bg-primary/20 transition-colors text-sm">
                회원 목록
              </button>
              <button className="block w-full text-left px-4 py-2 bg-surface-light text-text-light rounded-md hover:bg-primary/20 transition-colors text-sm">
                상담 관리
              </button>
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-border-light p-6 bg-surface-light">
            <h2 className="text-lg font-bold mb-4">매장 관리</h2>
            <div className="space-y-2">
              <button className="block w-full text-left px-4 py-2 bg-surface-light text-text-light rounded-md hover:bg-primary/20 transition-colors text-sm">
                트레이너 관리
              </button>
              <button className="block w-full text-left px-4 py-2 bg-surface-light text-text-light rounded-md hover:bg-primary/20 transition-colors text-sm">
                상품 관리
              </button>
            </div>
          </div>
        </div>

        {/* 최근 알림 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col rounded-lg border border-border-light p-6 bg-surface-light">
            <h2 className="text-lg font-bold mb-4">최근 활동 / 알림</h2>
            <ul className="divide-y divide-border-light">
              {[
                "김민준 회원님이 신규 등록했습니다.",
                "이서연 회원님의 회원권이 3일 후 만료됩니다.",
                "박도윤 회원님이 출석했습니다.",
                "[공지] 추석 연휴 운영시간 안내",
              ].map((msg, i) => (
                <li key={i} className="py-3 text-sm">
                  {msg}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col rounded-lg border border-border-light bg-surface-light p-6">
            <h2 className="text-lg font-bold mb-4">오늘의 스케줄</h2>
            <ul className="flex flex-col gap-3">
              <li>14:00 - 개인 PT (최지우 회원)</li>
              <li>16:00 - 그룹 요가 클래스</li>
              <li>18:00 - 개인 PT (이하윤 회원)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
