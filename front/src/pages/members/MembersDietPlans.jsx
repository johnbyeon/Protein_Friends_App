// src/pages/admin/MembersDietPlans.jsx
import React, { useState } from "react"

export default function MembersDietPlans() {
  const [selectedMember, setSelectedMember] = useState("김민준")
  const [month, setMonth] = useState(5)
  const [year, setYear] = useState(2024)

  const members = [
    {
      name: "김민준",
      phone: "010-1234-5678",
      trainer: "이로운",
      ptStatus: "PT 25회 남음",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB0XEtphDUefr5lpxeGKrQplzo6Q5RGankTPH8tKRYu-ynl-fXvsE-XgJ3VOIfgmNef6x668528c6eqewOkpT13_Li5dAf3m2EH377tc3LVySfw2xR8HzLFKVG2ndwoJ9yYclMn3UeuNwn-joIRP9nE1CuqfGgpHz7M3wyxlLv6OV6QpKwrB53t4J2gGas9RH1SGl27k9TPOVbPP3jXjp_kKfE_J7msMbFD5B6IsIt9NAG-VGTR0m3MDpdj-Xq5XGTLV0KHCUZ-KNs",
    },
    {
      name: "이서연",
      phone: "010-8765-4321",
      trainer: "최지아",
      ptStatus: "PT 만료",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB0XEtphDUefr5lpxeGKrQplzo6Q5RGankTPH8tKRYu-ynl-fXvsE-XgJ3VOIfgmNef6x668528c6eqewOkpT13_Li5dAf3m2EH377tc3LVySfw2xR8HzLFKVG2ndwoJ9yYclMn3UeuNwn-joIRP9nE1CuqfGgpHz7M3wyxlLv6OV6QpKwrB53t4J2gGas9RH1SGl27k9TPOVbPP3jXjp_kKfE_J7msMbFD5B6IsIt9NAG-VGTR0m3MDpdj-Xq5XGTLV0KHCUZ-KNs",
    },
    {
      name: "박도윤",
      phone: "010-5555-4444",
      trainer: "이로운",
      ptStatus: "PT 10회 남음",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB0XEtphDUefr5lpxeGKrQplzo6Q5RGankTPH8tKRYu-ynl-fXvsE-XgJ3VOIfgmNef6x668528c6eqewOkpT13_Li5dAf3m2EH377tc3LVySfw2xR8HzLFKVG2ndwoJ9yYclMn3UeuNwn-joIRP9nE1CuqfGgpHz7M3wyxlLv6OV6QpKwrB53t4J2gGas9RH1SGl27k9TPOVbPP3jXjp_kKfE_J7msMbFD5B6IsIt9NAG-VGTR0m3MDpdj-Xq5XGTLV0KHCUZ-KNs",
    },
  ]

  const days = [
    { day: 1, meals: 3, recommend: false },
    { day: 2, meals: 2, recommend: true },
    { day: 5, meals: 1, recommend: false },
    { day: 7, meals: 3, recommend: false },
    { day: 8, meals: 0, recommend: true },
    { day: 9, meals: 3, recommend: true, active: true },
    { day: 12, meals: 2, recommend: false },
    { day: 15, meals: 0, recommend: true },
  ]

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear((y) => y - 1)
    } else setMonth((m) => m - 1)
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear((y) => y + 1)
    } else setMonth((m) => m + 1)
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark min-h-screen flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between border-b border-border-light dark:border-border-dark px-6 py-3 sticky top-0 bg-background-dark">
        <div className="flex items-center gap-3 text-white">
          <div className="size-8 text-primary flex items-center justify-center">
            <svg
              fill="currentColor"
              height="28"
              width="28"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.14 5.57L2 7.71L3.43 9.14L2 10.57L3.43 12L7 8.43L15.57 17L12 20.57L13.43 22L14.86 20.57L16.29 22L18.43 19.86L19.86 21.29L21.29 19.86L19.86 18.43L22 16.29L20.57 14.86Z"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold">프로틴 프랜즈</h1>
        </div>
        <div className="bg-center bg-no-repeat bg-cover rounded-full size-10" style={{
          backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCWv6PK6uHIuU6FSourNK8U7EvzgJD3MRfIdkT3PNtI7eOKlgTtDcXXqyiwr2uh1FT6cQV-fq5cCPb_j3o-dkitZtWfO924D-Mv60jMXWXhCqErfwTLvZuxWQgIaXznlVr2ztUO1jagD4bfV6Eb97pLSApDbW_e9p6MzMcs1F3IXP5CahY7pVsl2Og_nR73mtfurLGrmEXDautZQ7pXcCUSlEToqsjlYs7dpBgODCwuarhM4uXI8PMaf3fGkuvp3NZQaim9ODXJrFk")`,
        }}></div>
      </header>

      {/* 본문 */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* 좌측 회원 목록 */}
          <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-4">전체 회원</h3>
            <input
              type="text"
              placeholder="회원 검색"
              className="w-full mb-4 rounded-lg border border-border-light bg-background-light px-4 py-2 text-sm focus:border-primary focus:ring-primary"
            />
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {members.map((m) => (
                  <div
                    key={m.name}
                    onClick={() => setSelectedMember(m.name)}
                    className={`flex items-start justify-between p-3 rounded-lg cursor-pointer transition ${
                      selectedMember === m.name
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-surface-dark/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${m.image})` }}
                      ></div>
                      <div>
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-xs text-subtle-text-light">{m.phone}</p>
                        <p className="text-xs text-subtle-text-light mt-1">
                          담당 트레이너: {m.trainer}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-subtle-text-light flex-shrink-0">
                      {m.ptStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 우측 식단 캘린더 */}
          <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{selectedMember}님의 식단 캘린더</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-full hover:bg-surface-dark/50"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-lg font-semibold">
                  {year}년 {month}월
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-full hover:bg-surface-dark/50"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <div key={d} className="py-2 text-subtle-text-light">
                  {d}
                </div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 2 // 임시 달력
                const entry = days.find((d) => d.day === day)
                if (day < 1 || day > 31)
                  return <div key={i} className="py-3 text-subtle-text-light"></div>

                return (
                  <div
                    key={i}
                    className={`relative py-3 rounded-lg cursor-pointer ${
                      entry?.active
                        ? "bg-primary/20 border border-primary"
                        : "hover:bg-surface-dark/50"
                    }`}
                  >
                    {day}
                    {entry?.meals > 0 && (
                      <span className="absolute top-1 right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {entry.meals}
                      </span>
                    )}
                    {entry?.recommend && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-recommend"></span>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-end gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>회원 기록 식단</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-recommend"></div>
                <span>트레이너 추천 식단</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
