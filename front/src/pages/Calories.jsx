import { useState, useEffect } from 'react'
import { apiJson } from '../lib/api'

export default function Calories() {
  const [foods, setFoods] = useState([])
  const [filteredFoods, setFilteredFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('전체')

  // 카테고리 목록 추출
  const categories = ['전체', ...new Set((foods || []).map(food => food.category).filter(Boolean))]

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        console.log('🔍 [Calories] 음식 데이터 fetching 시작')
        setLoading(true)
        
        // 임시 테스트: 직접 fetch 사용
        const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
        const directResponse = await fetch(`${SERVER_ORIGIN}/api/food`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const directData = await directResponse.json()
        console.log('🔍 [Calories] 직접 fetch 데이터:', directData)
        console.log('🔍 [Calories] 직접 fetch 데이터 길이:', directData?.length)
        
        const response = await apiJson('/api/food')
        console.log('🔍 [Calories] 응답 상태:', response.status)
        console.log('🔍 [Calories] 응답 ok 여부:', response.ok)
        console.log('🔍 [Calories] 응답 데이터:', response.data)
        
        if (!response.ok) {
          console.error('❌ [Calories] 응답 에러:', response.data)
          throw new Error(response.data?.message || '음식 데이터를 불러오는데 실패했습니다.')
        }
        
        console.log('✅ [Calories] 음식 데이터 로드 성공:', response.data)
        console.log('🔍 [Calories] 데이터 타입:', typeof response.data, 'isArray:', Array.isArray(response.data))
        console.log('🔍 [Calories] 데이터 길이:', response.data?.length)
        
        setFoods(response.data)
        setFilteredFoods(response.data)
      } catch (err) {
        console.error('❌ [Calories] 음식 데이터를 불러오는데 실패했습니다:', err)
        console.error('❌ [Calories] 에러 상세:', err.message, err.stack)
        setError('음식 데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchFoods()
  }, [])

  // 검색 및 필터링
  useEffect(() => {
    let filtered = foods || []

    // 카테고리 필터링
    if (selectedCategory !== '전체') {
      filtered = filtered.filter(food => food.category === selectedCategory)
    }

    // 검색어 필터링
    if (searchTerm.trim()) {
      filtered = filtered.filter(food =>
        food.foodName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredFoods(filtered)
  }, [foods, searchTerm, selectedCategory])

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setFilteredFoods(foods)
      return
    }

    try {
      const response = await apiJson(`/food/search?name=${encodeURIComponent(term)}`)
      if (!response.ok) {
        throw new Error(response.data?.message || '검색에 실패했습니다.')
      }
      setFilteredFoods(response.data)
    } catch (err) {
      console.error('검색에 실패했습니다:', err)
      // API 검색 실패 시 클라이언트 측 필터링으로 대체
      const filtered = (foods || []).filter(food =>
        food.foodName.toLowerCase().includes(term.toLowerCase())
      )
      setFilteredFoods(filtered)
    }
  }

  if (loading) {
    return (
      <main className="bg-background-dark text-text-light min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-400">칼로리표 데이터를 불러오는 중...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="bg-background-dark text-text-light min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-16">
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
      <div className="mx-auto max-w-6xl px-6 py-16">
        
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-4">
            칼로리표
          </h1>
          <p className="text-gray-400 text-lg">
            다양한 음식의 영양 정보를 확인하세요
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-8 space-y-4">
          {/* 검색창 */}
          <div className="relative">
            <input
              type="text"
              placeholder="음식 이름으로 검색..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                handleSearch(e.target.value)
              }}
              className="w-full px-4 py-3 pl-12 bg-surface-dark border border-border-dark rounded-lg text-text-light placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-black'
                    : 'bg-surface-dark text-gray-400 hover:bg-surface-light hover:text-text-light'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 결과 수 */}
        <div className="mb-6 text-gray-400">
          총 {(filteredFoods || []).length}개의 음식을 찾았습니다
        </div>

        {/* 음식 테이블 */}
        <div className="bg-surface-dark rounded-lg overflow-hidden border border-border-dark">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-light border-b border-border-dark">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-light">음식명</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-text-light">1회 제공량</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-text-light">칼로리</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-text-light">탄수화물</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-text-light">단백질</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-text-light">지방</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-text-light">카테고리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {(filteredFoods || []).map((food, index) => (
                  <tr key={food.foodId || index} className="hover:bg-surface-light transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-text-light">{food.foodName}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-300">{food.serving}g</td>
                    <td className="px-6 py-4 text-sm text-center font-semibold text-primary">{food.calorie}kcal</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-300">{food.carbohydrate}g</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-300">{food.protein}g</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-300">{food.fat}g</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
                        {food.category || '기타'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 빈 결과 */}
        {(!filteredFoods || filteredFoods.length === 0) && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-4">
              검색 결과가 없습니다
            </div>
            <p className="text-gray-500">
              다른 검색어나 카테고리를 시도해보세요
            </p>
          </div>
        )}
      </div>
    </main>
  )
}