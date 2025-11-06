// src/pages/admin/PosPT_Pass.jsx
import React, { useState } from "react"

export default function PosPT_Pass() {
  const [selectedTrainer, setSelectedTrainer] = useState("박서준 트레이너")
  const [selectedTicket, setSelectedTicket] = useState("PT 10회")
  const [startDate, setStartDate] = useState("2023-10-27")
  const [endDate, setEndDate] = useState("2024-01-26")
  const [totalPrice, setTotalPrice] = useState("500,000원")

  const ptTickets = [
    { label: "PT 10회", price: "500,000원" },
    { label: "PT 20회", price: "900,000원" },
    { label: "PT 30회", price: "1,200,000원" },
  ]

  const handleTicketChange = (ticket) => {
    setSelectedTicket(ticket.label)
    setTotalPrice(ticket.price)
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark min-h-screen flex flex-col">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col max-w-4xl mx-auto gap-8">
          {/* 헤더 */}
          <div className="flex flex-col gap-4 text-center">
            <div className="flex items-center justify-center gap-3 text-text-light dark:text-text-dark mx-auto">
              <div className="size-8 text-primary flex items-center justify-center">
                <svg
                  fill="currentColor"
                  height="28"
                  viewBox="0 0 24 24"
                  width="28"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.14 5.57L2 7.71L3.43 9.14L2 10.57L3.43 12L7 8.43L15.57 17L12 20.57L13.43 22L14.86 20.57L16.29 22L18.43 19.86L19.86 21.29L21.29 19.86L19.86 18.43L22 16.29L20.57 14.86Z"></path>
                </svg>
              </div>
              <h1 className="text-xl font-bold">프로틴 프랜즈</h1>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter">PT 이용권 현장 판매</h2>
          </div>

          {/* 회원 검색 */}
          <div className="flex flex-col gap-4">
            <div className="flex w-full items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="search"
                  placeholder="회원 이름 또는 연락처로 검색"
                  className="w-full rounded-lg border border-border-light bg-surface-light px-4 py-3 pr-10 text-base text-text-light placeholder:text-subtle-text-light focus:border-primary focus:ring-primary"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="material-symbols-outlined text-subtle-text-light">
                    search
                  </span>
                </div>
              </div>
              <button className="flex h-12 cursor-pointer items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white hover:bg-primary/90 transition-colors">
                검색
              </button>
            </div>
          </div>

          {/* 이용권 정보 */}
          <div className="border border-border-light rounded-lg bg-surface-light p-6 flex flex-col gap-6">
            <h3 className="text-xl font-bold">이용권 정보</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 회원 정보 */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="member-name"
                  className="text-sm font-medium text-subtle-text-light"
                >
                  회원명
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border-light bg-background-light p-3">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD1ZXEpMWY8EXzT_hHxkfmT2vnR1OUlfAeUIuzZJtST7QsGA5oZ-ji5gntbHG69OhqkFoFTDNyeKNuyelm3UbiznVk333UlqThcP7iJ6zpxuU_uM6qTA8jK9agGuGX7Gm-iQ1RFAbWPZMFpLe0S6l3Naq99EQjyxzghaMuvKMBWdJSb8zm23I5lEZnW6vcXUEAG65fwZKceL5eqWs2GuOJVq063sITTr824HceQ5hgqpDevs_Rp4NzQr8EWZ6WhviJGLpg5B8OywK4")',
                    }}
                  ></div>
                  <span className="text-base text-text-light">김철수</span>
                  <span className="text-sm text-subtle-text-light">010-1234-5678</span>
                </div>
              </div>

              {/* 트레이너 선택 */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="trainer"
                  className="text-sm font-medium text-subtle-text-light"
                >
                  담당 트레이너
                </label>
                <div className="relative">
                  <select
                    id="trainer"
                    value={selectedTrainer}
                    onChange={(e) => setSelectedTrainer(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border-light bg-background-light px-4 py-3 text-base text-text-light focus:border-primary focus:ring-primary"
                  >
                    <option>트레이너 선택</option>
                    <option>박서준 트레이너</option>
                    <option>이영희 트레이너</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-subtle-text-light">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* 이용권 선택 */}
            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-semibold">이용권 선택</h4>
              <div className="space-y-3">
                {ptTickets.map((ticket) => (
                  <label
                    key={ticket.label}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-150 ${
                      selectedTicket === ticket.label
                        ? "border-primary bg-primary/10"
                        : "border-border-light hover:border-primary/50"
                    }`}
                    onClick={() => handleTicketChange(ticket)}
                  >
                    <input
                      type="radio"
                      name="pt-ticket"
                      className="form-radio text-primary bg-background-light border-border-light focus:ring-primary"
                      checked={selectedTicket === ticket.label}
                      readOnly
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="font-medium">{ticket.label}</span>
                      <span className="font-bold text-lg">{ticket.price}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 날짜 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="start-date"
                  className="text-sm font-medium text-subtle-text-light"
                >
                  이용권 시작일
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-border-light bg-background-light px-4 py-3 text-base text-text-light focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="end-date"
                  className="text-sm font-medium text-subtle-text-light"
                >
                  이용권 만료일
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-border-light bg-background-light px-4 py-3 text-base text-text-light focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            {/* 금액 및 버튼 */}
            <div className="border-t border-border-light pt-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-lg text-subtle-text-light">총 금액</span>
                <span className="text-3xl font-bold text-primary">{totalPrice}</span>
              </div>
              <button className="w-full flex h-14 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-base font-bold text-white hover:bg-primary/90 transition-colors">
                이용권 추가하기
              </button>
            </div>
          </div>

          {/* 회원 미검색 시 안내 박스 */}
          <div className="hidden items-center justify-center text-center p-12 border-2 border-dashed border-border-light rounded-lg bg-surface-light/50">
            <div className="flex flex-col items-center gap-4">
              <span className="material-symbols-outlined !text-5xl text-subtle-text-light">
                person_search
              </span>
              <p className="text-lg font-medium">회원을 검색해주세요.</p>
              <p className="text-subtle-text-light">
                회원 검색 후 PT 이용권을 할당할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
