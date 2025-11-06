import { useState, useEffect } from 'react'
import { getFaqs, getFaqCategories } from '../../../lib/api'

export default function FaqList() {
  const [faqs, setFaqs] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null) // null = 전체
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeAccordion, setActiveAccordion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 카테고리 로드
  useEffect(() => {
    loadCategories()
  }, [])

  // FAQ 로드
  useEffect(() => {
    loadFaqs()
  }, [selectedCategory, searchKeyword])

  const loadCategories = async () => {
    try {
      const data = await getFaqCategories()
      setCategories(data || [])
    } catch (err) {
      console.error('카테고리 로드 실패:', err)
    }
  }

  const loadFaqs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getFaqs(selectedCategory, searchKeyword, 0, 100)
      setFaqs(data.content || [])
    } catch (err) {
      console.error('FAQ 로드 실패:', err)
      setError('FAQ를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadFaqs()
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 bg-background-dark font-display text-text-light min-h-screen">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {/* 헤더 */}
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">자주 하는 질문</h1>
            <p className="text-gray-400">궁금하신 내용을 빠르게 찾아보세요.</p>
          </div>

          {/* 검색바 */}
          <div className="flex flex-col sm:flex-row w-full items-center gap-4">
            <div className="relative flex-1 w-full">
              <input
                className="w-full rounded-lg border border-border-dark bg-surface-dark px-4 py-3 pr-10 text-base text-text-light placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                placeholder="질문을 검색하세요"
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="material-symbols-outlined text-gray-400">search</span>
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="flex h-12 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-base font-bold text-black w-full sm:w-auto hover:opacity-90"
            >
              검색
            </button>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-primary text-black'
                  : 'bg-surface-dark text-text-light hover:bg-primary/20'
              }`}
            >
              전체
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-black'
                    : 'bg-surface-dark text-text-light hover:bg-primary/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ 목록 */}
          {loading && (
            <div className="text-center py-12">
              <div className="text-gray-400">FAQ를 불러오는 중...</div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-error">{error}</div>
            </div>
          )}

          {!loading && !error && faqs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400">
                {searchKeyword ? '검색 결과가 없습니다.' : '등록된 FAQ가 없습니다.'}
              </div>
            </div>
          )}

          {!loading && !error && faqs.length > 0 && (
            <div className="flex flex-col gap-4">
              {faqs.map((faq) => (
                <div
                  key={faq.faqid}
                  className="border border-border-dark rounded-lg bg-surface-dark overflow-hidden transition-all duration-200"
                >
                  <div
                    onClick={() => setActiveAccordion(activeAccordion === faq.faqid ? null : faq.faqid)}
                    className="p-6 cursor-pointer hover:bg-surface-light/50"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                            {faq.faqcategory}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-text-light">
                          {faq.faqquestion}
                        </h3>
                        {activeAccordion === faq.faqid && (
                          <div className="mt-4 pt-4 border-t border-border-dark">
                            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                              {faq.faqanswer}
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                          activeAccordion === faq.faqid
                            ? 'rotate-180 bg-primary/10'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <span className="material-symbols-outlined text-primary">
                          expand_more
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </main>
  )
}

