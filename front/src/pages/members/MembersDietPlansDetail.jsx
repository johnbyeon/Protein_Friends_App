// src/pages/admin/MembersDietPlansDetail.jsx
import React, { useState } from "react"

export default function MembersDietPlansDetail() {
  const [selectedMeal, setSelectedMeal] = useState("아침")
  const [comment, setComment] = useState("")

  const meals = [
    { type: "아침", time: "오전 8:30", active: true },
    { type: "점심", time: "오후 12:45", active: false },
    { type: "저녁", time: "오후 7:15", active: false },
  ]

  const recommendedMeals = [
    {
      type: "아침 추천",
      content: "귀리 오트밀 (귀리 50g, 블루베리, 견과류), 삶은 달걀 2개",
      kcal: "380 kcal",
    },
    {
      type: "점심 추천",
      content: "현미밥 1/2공기, 구운 연어 120g, 브로콜리, 아스파라거스",
      kcal: "420 kcal",
    },
    {
      type: "저녁 추천",
      content: "두부 샐러드 (두부 150g, 각종 채소, 오리엔탈 드레싱)",
      kcal: "300 kcal",
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-6xl max-h-[90vh] bg-background-dark rounded-xl flex overflow-hidden">
        {/* 좌측: 식사 목록 */}
        <div className="w-1/4 bg-surface-light border-r border-border-dark p-6 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-text-light">5월 9일 식사 기록</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
            {meals.map((meal) => (
              <div
                key={meal.type}
                onClick={() => setSelectedMeal(meal.type)}
                className={`p-4 rounded-lg cursor-pointer ${
                  selectedMeal === meal.type
                    ? "bg-primary/20 border border-primary"
                    : "bg-surface-dark hover:bg-surface-dark/50"
                }`}
              >
                <p className="font-bold">{meal.type}</p>
                <p className="text-sm text-subtle-text-light">{meal.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 중앙: 식사 상세 */}
        <div className="w-1/2 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h4 className="text-lg font-semibold text-text-light mb-2">식사 정보</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-subtle-text-light">시간:</span> 오전 8:30
              </div>
              <div>
                <span className="font-semibold text-subtle-text-light">종류:</span> {selectedMeal}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-text-light mb-2">식단 사진</h4>
            <div
              className="aspect-video w-full rounded-lg bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDbtIGH_zSJO8j-nmUhG-Gp32U2edb9QC5DZt8sVT-7AhyucVziEFyFQbGuQ6G-63I6Hh99L_JsSPUmNgM6EdYLRamuJUkGZq_UnPT9wnvA6hbFT2ceraU3lkunx-PXJCKzhciTkJ0VGkP0ojp5tvdBTSbUz6E7q_94uC6ys5BAl0EsJp7LEGgNpnX6OIgi0qSdlUQ5qt_z1BJD07zyHZzSPy25Z6JpHFXjEv5uS2z_mUHlwlFieb0KeM65B251b-zAgZ2MQd8Nigk')",
              }}
            ></div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-text-light mb-2">섭취 음식 (450 kcal)</h4>
            <p className="text-sm leading-relaxed">
              닭가슴살 샐러드 (닭가슴살 150g, 양상추, 파프리카, 오이, 방울토마토, 올리브 드레싱),
              고구마 1개, 저지방 우유 1컵
            </p>
          </div>

          <div className="flex-1 flex flex-col">
            <h4 className="text-lg font-semibold text-text-light mb-2">트레이너 코멘트</h4>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="코멘트를 입력하세요..."
              className="flex-1 w-full rounded-lg border border-border-light bg-surface-dark px-4 py-3 text-sm text-text-light placeholder:text-subtle-text-light focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-surface-light hover:bg-surface-dark/50 text-text-light">
              닫기
            </button>
            <button className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/80">
              코멘트 저장
            </button>
          </div>
        </div>

        {/* 우측: 트레이너 추천 식단 */}
        <div className="w-1/4 bg-surface-light border-l border-border-dark p-6 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-text-light">트레이너 추천 식단</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
            {recommendedMeals.map((rec) => (
              <div key={rec.type} className="p-4 rounded-lg bg-surface-dark">
                <p className="font-bold text-recommend">{rec.type}</p>
                <p className="text-sm mt-2">{rec.content}</p>
                <p className="text-sm text-subtle-text-light mt-1">칼로리: {rec.kcal}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
