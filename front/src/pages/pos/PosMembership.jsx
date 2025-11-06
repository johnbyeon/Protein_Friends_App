// src/pages/admin/PosMembership.jsx
import React, { useEffect, useState } from "react"

export default function PosMembership() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedDuration, setSelectedDuration] = useState(null)
  const [trainer, setTrainer] = useState("김철수 트레이너")

  // 시작일 초기값 오늘 날짜 설정
  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    setStartDate(`${year}-${month}-${day}`)
  }, [])

  // 종료일 계산
  useEffect(() => {
    if (!selectedDuration) {
      setEndDate("")
      return
    }
    if (!startDate) return

    const start = new Date(startDate)
    const end = new Date(start)
    end.setMonth(end.getMonth() + parseInt(selectedDuration))
    const formattedEnd = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(
      end.getDate()
    ).padStart(2, "0")}`
    setEndDate(formattedEnd)
  }, [selectedDuration, startDate])

  const memberships = [
    { label: "1개월", duration: 1, price: "100,000원" },
    { label: "3개월", duration: 3, price: "250,000원" },
    { label: "6개월", duration: 6, price: "450,000원" },
    { label: "12개월", duration: 12, price: "800,000원" },
  ]

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark min-h-screen flex flex-col items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">기간제 회원권 판매</h1>

        <div className="space-y-6 bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark">
          {/* 회원 검색 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">회원 검색</h2>
            <div className="flex w-full items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="회원 이름 또는 연락처를 입력하세요"
                  className="w-full rounded-lg border border-border-light bg-background-light px-4 py-3 pr-10 text-base text-text-light placeholder:text-subtle-text-light focus:border-primary focus:ring-primary"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="material-symbols-outlined text-subtle-text-light">search</span>
                </div>
              </div>
              <button className="flex h-12 cursor-pointer items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white">
                검색
              </button>
            </div>
          </div>

          <div className="border-t border-border-light dark:border-border-dark my-6" />

          {/* 회원 정보 */}
          <div className="space-y-6" id="member-info">
            <div className="flex items-center gap-4">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-16"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuARr4x-fOMUZiYnKxSpMPs1V4Axd9JxEN2jk4efPbmFfvCoIMNcEYxAy2Zij0N6vCc5eFvZ7IVeazi2DAXXiey0AwQHpX-evNB8pLqYgyaoPstITvsJLPfeXrBJAB2bznvFPtwEsDQ7Hi7_7enNtAl-SPM2SYC_WpP4up_6jCVkqB_978_qgbZSXPsXFC1GoIODeiw3cFgCTR07Q0e2j8YEDEUScfW9PC38DtuwhgsKk5qI24GGxxHHad3VdNnSxJNyYI5tV9vIX70")',
                }}
              ></div>
              <div>
                <p className="text-lg font-bold">김프로틴</p>
                <p className="text-sm text-subtle-text-light">010-1234-5678</p>
              </div>
            </div>

            {/* 회원권 선택 */}
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold">회원권 선택</h2>
              <div className="grid grid-cols-2 gap-4">
                {memberships.map((m) => (
                  <label
                    key={m.duration}
                    className={`relative flex flex-col items-center justify-center rounded-lg border p-6 text-center cursor-pointer transition-all duration-200 ${
                      selectedDuration === m.duration
                        ? "border-primary ring-2 ring-primary"
                        : "border-border-light hover:border-primary"
                    }`}
                    onClick={() => setSelectedDuration(m.duration)}
                  >
                    <input
                      type="radio"
                      name="membership-option"
                      value={m.duration}
                      checked={selectedDuration === m.duration}
                      onChange={() => setSelectedDuration(m.duration)}
                      className="sr-only"
                    />
                    {selectedDuration === m.duration && (
                      <span className="material-symbols-outlined absolute right-3 top-3 text-primary">
                        check_circle
                      </span>
                    )}
                    <p className="text-2xl font-bold">{m.label}</p>
                    <p className="text-sm text-subtle-text-light">{m.price}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* 담당 트레이너 및 날짜 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="trainer"
                  className="text-sm font-medium text-subtle-text-light dark:text-subtle-text-dark"
                >
                  담당 트레이너
                </label>
                <div className="relative">
                  <select
                    id="trainer"
                    value={trainer}
                    onChange={(e) => setTrainer(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border-light bg-background-light px-4 py-3 text-base text-text-light focus:border-primary focus:ring-primary"
                  >
                    <option>김철수 트레이너</option>
                    <option>박서준 트레이너</option>
                    <option>이영희 트레이너</option>
                    <option>담당자 없음</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-subtle-text-light pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="start-date"
                  className="text-sm font-medium text-subtle-text-light dark:text-subtle-text-dark"
                >
                  시작일
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-border-light bg-background-light px-4 py-3 text-base text-text-light focus:border-primary focus:ring-primary"
                  style={{ colorScheme: "dark" }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="end-date"
                  className="text-sm font-medium text-subtle-text-light dark:text-subtle-text-dark"
                >
                  종료일
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  disabled
                  className="w-full rounded-lg border border-border-light bg-background-light px-4 py-3 text-base text-text-light focus:border-primary focus:ring-primary disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>
          </div>

          <button className="w-full flex h-14 cursor-pointer items-center justify-center rounded-lg bg-primary px-6 text-lg font-bold text-white mt-6">
            추가
          </button>
        </div>
      </div>
    </div>
  )
}
