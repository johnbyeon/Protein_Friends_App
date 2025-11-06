import { useState, useEffect } from 'react'
import { apiJson } from '../lib/api'

export default function DietPlans() {
  const [dietPlans, setDietPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // TODO: 실제 식단 관리 API 연동
    // 현재는 임시 데이터 표시
    const mockData = [
      {
        id: 1,
        date: '2024-11-06',
        meals: [
          { type: '아침', foods: '현미밥, 계란후라이, 시금치나물', calories: 450 },
          { type: '점심', foods: '닭가슴살 샐러드, 통밀빵', calories: 380 },
          { type: '저녁', foods: '연어스테이크, 브로콜, 현미밥', calories: 520 }
        ],
        totalCalories: 1350,
        goal: 1500
      },
      {
        id: 2,
        date: '2024-11-05',
        meals: [
          { type: '아침', foods: '오트밀, 바나나, 견과류', calories: 380 },
          { type: '점심', foods: '김치찌개, 현미밥, 멸치볶음', calories: 420 },
          { type: '저녁', foods: '두부조림, 현미밥, 된장국', calories: 390 }
        ],
        totalCalories: 1190,
        goal: 1500
      }
    ]

    setTimeout(() => {
      setDietPlans(mockData)
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <main className="bg-background-dark text-text-light min-h-screen">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-400">식단 데이터를 불러오는 중...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="bg-background-dark text-text-light min-h-screen">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="text-center">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-primary text-black rounded-lg hover:opacity-80"
            >
              다시 시도
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-background-dark text-text-light min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16">
        
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-4">
            내 식단관리
          </h1>
          <p className="text-gray-400 text-lg">
            매일의 식단을 기록하고 관리하세요
          </p>
        </div>

        {/* 식단 목록 */}
        <div className="space-y-6">
          {dietPlans.map((plan) => (
            <div key={plan.id} className="bg-surface-dark rounded-lg border border-border-dark p-6">
              {/* 날짜와 총칼로리 */}
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-dark">
                <h3 className="text-xl font-semibold text-text-light">{plan.date}</h3>
                <div className="text-right">
                  <p className="text-sm text-gray-400">목표: {plan.goal}kcal</p>
                  <p className={`text-lg font-bold ${
                    plan.totalCalories <= plan.goal ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    섭취: {plan.totalCalories}kcal
                  </p>
                </div>
              </div>

              {/* 식사 내역 */}
              <div className="space-y-3">
                {plan.meals.map((meal, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                        {meal.type}
                      </span>
                      <span className="text-gray-300">{meal.foods}</span>
                    </div>
                    <span className="text-gray-400 font-medium">{meal.calories}kcal</span>
                  </div>
                ))}
              </div>

              {/* 칼로리 차이 */}
              <div className="mt-4 pt-4 border-t border-border-dark">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">남은 칼로리</span>
                  <span className={`font-bold text-lg ${
                    plan.goal - plan.totalCalories >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {plan.goal - plan.totalCalories >= 0 ? '+' : ''}{plan.goal - plan.totalCalories}kcal
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 빈 상태 */}
        {dietPlans.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-xl mb-4">
              식단 기록이 없습니다
            </div>
            <p className="text-gray-500 mb-6">
              첫 번째 식단을 기록해보세요
            </p>
            <button className="px-6 py-3 bg-primary text-black rounded-lg font-semibold hover:opacity-80 transition-opacity">
              식단 추가하기
            </button>
          </div>
        )}

        {/* 식단 추가 버튼 */}
        {dietPlans.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-primary text-black rounded-lg font-semibold hover:opacity-80 transition-opacity">
              식단 추가하기
            </button>
          </div>
        )}
      </div>
    </main>
  )
}