// src/pages/admin/MembersDietRecommendations.jsx
import React, { useState } from "react"

export default function MembersDietRecommendations() {
  const [showModal, setShowModal] = useState(false)
  const toggleModal = () => setShowModal(!showModal)

  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1)
  const kcalDays = { 1: 1850, 2: 1920, 4: 2100, 6: 1980, 9: 2050, 11: 2200, 13: 1900, 15: 1880, 18: 1750, 20: 2150, 22: 2300, 25: 2000, 29: 1950 }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark font-display text-text-light overflow-x-hidden">
      {/* 헤더 */}
      <header className="flex items-center justify-between border-b border-border-dark px-6 py-3 bg-background-dark sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="size-8 text-primary flex items-center justify-center">
            <svg fill="currentColor" height="28" width="28" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.14 5.57L2 7.71L3.43 9.14L2 10.57L3.43 12L7 8.43L15.57 17L12 20.57L13.43 22L14.86 20.57L16.29 22L18.43 19.86L19.86 21.29L21.29 19.86L19.86 18.43L22 16.29L20.57 14.86Z"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold">프로틴 프랜즈</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative">
            <span className="material-symbols-outlined text-subtle-text-light hover:text-text-light">notifications</span>
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"></span>
          </button>
          <div
            className="bg-center bg-cover rounded-full size-10"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCWv6PK6uHIuU6FSourNK8U7EvzgJD3MRfIdkT3PNtI7eOKlgTtDcXXqyiwr2uh1FT6cQV-fq5cCPb_j3o-dkitZtWfO924D-Mv60jMXWXhCqErfwTLvZuxWQgIaXznlVr2ztUO1jagD4bfV6Eb97pLSApDbW_e9p6MzMcs1F3IXP5CahY7pVsl2Og_nR73mtfurLGrmEXDautZQ7pXcCUSlEToqsjlYs7dpBgODCwuarhM4uXI8PMaf3fGkuvp3NZQaim9ODXJrFk')",
            }}
          ></div>
        </div>
      </header>

      {/* 메인 */}
      <main className="flex-1 px-6 py-8">
        <div className="flex flex-col gap-8 max-w-7xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold">회원 식단 관리</h2>
            <p className="text-subtle-text-light">트레이너가 회원에게 식단을 추천하고 관리합니다.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 좌측 회원 리스트 */}
            <div className="bg-surface-light border border-border-dark rounded-lg p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold">회원 선택</h3>
              <div className="relative">
                <input
                  placeholder="회원 이름 검색"
                  className="w-full rounded-lg border border-border-light bg-surface-dark px-4 py-3 pr-10 text-sm placeholder:text-subtle-text-light focus:border-primary focus:ring-primary"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="material-symbols-outlined text-subtle-text-light">search</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto max-h-96 pr-2 -mr-2">
                {["김민준", "이서아", "박도윤", "최지우"].map((name, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer ${
                      i === 0 ? "bg-border-light" : "hover:bg-surface-dark"
                    }`}
                  >
                    <div
                      className="bg-center bg-cover rounded-full size-10"
                      style={{
                        backgroundImage:
                          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBlT7lOkSZpyXGIOKudXMtoOsEN6fjbQivuAyD7ZnnCeE_MSve9R1s4v_rQv7J67dl4qmLg99BMKAaQIab6BihSMK3PY8VhbELBdHIzKtMHJnYkCt06csOSHzNAPwfo6rEsASnrJ91TKqOxfRTaFGhRd1B1c3j60e2qu18eoPqKxL2ROIO4EqCRNI8B8KMGDMMNdd-zA6VE4omOuTp-aiqaLwusp_8fS2fzB7ePzyLoh5SQjK4YFDhObgRAw0hPgz-YzuniiXBhmqk')",
                      }}
                    ></div>
                    <div>
                      <p className="font-bold">{name}</p>
                      <p className="text-sm text-subtle-text-light">{i % 2 === 0 ? "남, 28세" : "여, 32세"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 우측 캘린더 */}
            <div className="lg:col-span-2 bg-surface-light border border-border-dark rounded-lg p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div
                    className="bg-center bg-cover rounded-full size-16"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBlT7lOkSZpyXGIOKudXMtoOsEN6fjbQivuAyD7ZnnCeE_MSve9R1s4v_rQv7J67dl4qmLg99BMKAaQIab6BihSMK3PY8VhbELBdHIzKtMHJnYkCt06csOSHzNAPwfo6rEsASnrJ91TKqOxfRTaFGhRd1B1c3j60e2qu18eoPqKxL2ROIO4EqCRNI8B8KMGDMMNdd-zA6VE4omOuTp-aiqaLwusp_8fS2fzB7ePzyLoh5SQjK4YFDhObgRAw0hPgz-YzuniiXBhmqk')",
                    }}
                  ></div>
                  <div>
                    <h3 className="text-xl font-bold">김민준 회원</h3>
                    <p className="text-sm text-subtle-text-light">남성, 28세, 180cm, 75kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-light bg-surface-dark hover:bg-border-light">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <h4 className="text-lg font-semibold">2024년 5월</h4>
                  <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-light bg-surface-dark hover:bg-border-light">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px text-sm bg-border-light border border-border-dark rounded-lg overflow-hidden">
                {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                  <div key={d} className="py-2 bg-surface-dark/50 font-semibold text-subtle-text-light">
                    {d}
                  </div>
                ))}
                {calendarDays.map((day) => (
                  <div
                    key={day}
                    onClick={toggleModal}
                    className="bg-surface-light p-2 h-28 flex flex-col items-start justify-start cursor-pointer hover:bg-surface-dark relative"
                  >
                    <span>{day}</span>
                    {kcalDays[day] && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-primary font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        <span>{kcalDays[day]} Kcal</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 팝업 */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/80 z-40"
            onClick={() => setShowModal(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-6xl bg-background-dark border border-border-light rounded-xl shadow-lg flex flex-col h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b border-border-light">
                <h3 className="text-xl font-bold">식단 등록</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-light"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 flex-1 overflow-hidden">
                {/* 좌측 템플릿 목록 */}
                <div className="md:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2">
                  <input
                    placeholder="템플릿 이름 검색"
                    className="w-full rounded-lg border border-border-light bg-surface-dark px-4 py-2 text-sm placeholder:text-subtle-text-light focus:border-primary focus:ring-primary"
                  />
                  {["닭가슴살 샐러드", "현미밥과 구운 연어", "두부 야채볶음", "소고기와 고구마"].map((food, i) => (
                    <div
                      key={i}
                      className="bg-surface-light p-3 rounded-lg cursor-grab border border-border-light flex justify-between hover:border-primary"
                    >
                      <span className="font-bold text-sm">{food}</span>
                      <span className="text-xs text-subtle-text-light">{400 + i * 100} Kcal</span>
                    </div>
                  ))}
                  <button className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg border border-dashed border-border-light h-12 text-sm text-subtle-text-light hover:bg-surface-light hover:text-text-light">
                    <span className="material-symbols-outlined">add</span>새 템플릿 추가
                  </button>
                </div>

                {/* 우측 식단 구성 */}
                <div className="md:col-span-2 flex flex-col gap-4">
                  <h4 className="text-lg font-semibold">2024년 5월 식단 구성</h4>
                  <div className="flex-grow grid grid-cols-4 gap-2">
                    {[16, 17, 18, 19].map((d, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center p-3 rounded-lg border border-border-light bg-surface-light ${
                          d === 17 ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <span className={`text-sm ${d === 17 ? "text-primary" : "text-subtle-text-light"}`}>5/{d}</span>
                        <div className="mt-2 flex-1 w-full flex items-center justify-center text-xs text-subtle-text-light border-dashed border-2 border-border-light rounded-md py-6">
                          템플릿 드롭
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3 mt-auto">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 rounded-lg bg-surface-dark hover:bg-border-light"
                    >
                      취소
                    </button>
                    <button className="px-8 py-2 rounded-lg bg-primary hover:bg-primary/80 text-white">
                      저장하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
