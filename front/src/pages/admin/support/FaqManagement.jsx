import { useState, useEffect } from 'react'
import { getFaqs, getFaqCategories, createFaq, updateFaq, deleteFaq } from '../../../lib/api'

export default function FaqManagement() {
  const [faqs, setFaqs] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null) // null = 전체
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeAccordion, setActiveAccordion] = useState(null)
  const [showEditPopup, setShowEditPopup] = useState(false)
  const [currentFaq, setCurrentFaq] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 새 질문 등록 폼
  const [newFaq, setNewFaq] = useState({
    faqcategory: '',
    faqtitle: '',
    faqquestion: '',
    faqanswer: ''
  })
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false)

  // 수정 폼
  const [editFaq, setEditFaq] = useState({
    faqcategory: '',
    faqtitle: '',
    faqquestion: '',
    faqanswer: ''
  })
  const [showEditCategorySuggestions, setShowEditCategorySuggestions] = useState(false)

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
      setError('카테고리를 불러오는데 실패했습니다.')
    }
  }

  const loadFaqs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getFaqs(selectedCategory, searchKeyword, 0, 100) // 페이지네이션 필요 시 변경
      setFaqs(data.content || [])
    } catch (err) {
      console.error('FAQ 로드 실패:', err)
      setError('FAQ를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 카테고리 자동완성 필터링
  const filteredNewCategories = newFaq.faqcategory
    ? categories.filter(cat =>
        cat.toLowerCase().includes(newFaq.faqcategory.toLowerCase()) && cat !== newFaq.faqcategory
      )
    : categories

  const filteredEditCategories = editFaq.faqcategory
    ? categories.filter(cat =>
        cat.toLowerCase().includes(editFaq.faqcategory.toLowerCase()) && cat !== editFaq.faqcategory
      )
    : categories

  // 새 질문 등록
  const handleCreateFaq = async () => {
    if (!newFaq.faqcategory || !newFaq.faqquestion || !newFaq.faqanswer) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    try {
      const payload = {
        faqtitle: newFaq.faqquestion.substring(0, 50), // 제목은 질문의 일부로 자동 생성
        faqquestion: newFaq.faqquestion,
        faqanswer: newFaq.faqanswer,
        faqcategory: newFaq.faqcategory
      }
      await createFaq(payload)
      alert('FAQ가 등록되었습니다.')
      setNewFaq({ faqcategory: '', faqtitle: '', faqquestion: '', faqanswer: '' })
      loadFaqs()
      loadCategories() // 새 카테고리가 추가될 수 있으므로 다시 로드
    } catch (err) {
      console.error('FAQ 등록 실패:', err)
      alert('FAQ 등록에 실패했습니다.')
    }
  }

  // 수정 팝업 열기
  const openEditPopup = (faq) => {
    setCurrentFaq(faq)
    setEditFaq({
      faqcategory: faq.faqcategory,
      faqtitle: faq.faqtitle || '',
      faqquestion: faq.faqquestion,
      faqanswer: faq.faqanswer
    })
    setShowEditPopup(true)
  }

  // FAQ 수정
  const handleUpdateFaq = async () => {
    if (!editFaq.faqcategory || !editFaq.faqquestion || !editFaq.faqanswer) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    try {
      const payload = {
        faqtitle: editFaq.faqquestion.substring(0, 50), // 제목은 질문의 일부로 자동 생성
        faqquestion: editFaq.faqquestion,
        faqanswer: editFaq.faqanswer,
        faqcategory: editFaq.faqcategory
      }
      await updateFaq(currentFaq.faqid, payload)
      alert('FAQ가 수정되었습니다.')
      setShowEditPopup(false)
      loadFaqs()
      loadCategories()
    } catch (err) {
      console.error('FAQ 수정 실패:', err)
      alert('FAQ 수정에 실패했습니다.')
    }
  }

  // FAQ 삭제
  const handleDeleteFaq = async (faqId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await deleteFaq(faqId)
      alert('FAQ가 삭제되었습니다.')
      loadFaqs()
      loadCategories()
    } catch (err) {
      console.error('FAQ 삭제 실패:', err)
      alert('FAQ 삭제에 실패했습니다.')
    }
  }

  // 검색 실행
  const handleSearch = () => {
    loadFaqs()
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 bg-background-dark font-display text-text-light min-h-screen">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {/* 헤더 */}
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">자주 하는 질문 관리</h1>
            <p className="text-gray-400">질문을 등록, 수정, 삭제하고 카테고리별로 관리하세요.</p>
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
              className="flex h-12 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-base font-bold text-white w-full sm:w-auto hover:opacity-90"
            >
              검색
            </button>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === null ? 'bg-primary text-white' : 'bg-surface-dark text-text-light hover:bg-primary/20'
              }`}
            >
              전체
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-surface-dark text-text-light hover:bg-primary/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* 새 질문 등록 폼 */}
          <div className="border border-border-dark rounded-lg bg-surface-dark p-6 flex flex-col gap-4">
            <h2 className="text-xl font-semibold">새 질문 등록</h2>

            {/* 카테고리 입력 (자동완성) */}
            <div className="flex flex-col gap-2 relative">
              <label className="text-gray-400" htmlFor="new-category">
                카테고리
              </label>
              <input
                className="w-full rounded-md border-border-dark bg-background-dark px-4 py-2 text-text-light placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                id="new-category"
                placeholder="카테고리를 입력하거나 선택하세요"
                type="text"
                value={newFaq.faqcategory}
                onChange={(e) => setNewFaq({ ...newFaq, faqcategory: e.target.value })}
                onFocus={() => setShowCategorySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
              />
              {showCategorySuggestions && filteredNewCategories.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-surface-dark border border-border-dark rounded-md mt-1 z-10 max-h-40 overflow-y-auto">
                  {filteredNewCategories.map((cat) => (
                    <div
                      key={cat}
                      onClick={() => {
                        setNewFaq({ ...newFaq, faqcategory: cat })
                        setShowCategorySuggestions(false)
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-primary/20"
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 질문 입력 */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-400" htmlFor="new-question">
                질문
              </label>
              <textarea
                className="w-full rounded-md border-border-dark bg-background-dark px-4 py-2 text-text-light placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                id="new-question"
                placeholder="새로운 질문을 입력하세요."
                rows="2"
                value={newFaq.faqquestion}
                onChange={(e) => setNewFaq({ ...newFaq, faqquestion: e.target.value })}
              />
            </div>

            {/* 답변 입력 */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-400" htmlFor="new-answer">
                답변
              </label>
              <textarea
                className="w-full rounded-md border-border-dark bg-background-dark px-4 py-2 text-text-light placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                id="new-answer"
                placeholder="답변을 입력하세요."
                rows="4"
                value={newFaq.faqanswer}
                onChange={(e) => setNewFaq({ ...newFaq, faqanswer: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-4 mt-2">
              <button
                onClick={() => setNewFaq({ faqcategory: '', faqtitle: '', faqquestion: '', faqanswer: '' })}
                className="px-6 py-2 rounded-lg text-sm font-bold bg-gray-700 text-text-light hover:bg-opacity-80"
              >
                취소
              </button>
              <button
                onClick={handleCreateFaq}
                className="px-6 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-opacity-80"
              >
                등록
              </button>
            </div>
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
              <div className="text-gray-400">등록된 FAQ가 없습니다.</div>
            </div>
          )}

          {!loading && !error && faqs.length > 0 && (
            <div className="flex flex-col gap-4">
              {faqs.map((faq) => (
                <div key={faq.faqid} className="border border-border-dark rounded-lg bg-surface-dark overflow-hidden">
                  <div
                    onClick={() => setActiveAccordion(activeAccordion === faq.faqid ? null : faq.faqid)}
                    className="p-6 cursor-pointer"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 flex flex-col gap-2">
                        <h3 className="text-lg font-semibold">
                          [{faq.faqcategory}] {faq.faqquestion}
                        </h3>
                        {activeAccordion === faq.faqid && (
                          <p className="text-gray-400 mt-2">{faq.faqanswer}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditPopup(faq)
                          }}
                          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10"
                        >
                          <span className="material-symbols-outlined text-gray-400">edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteFaq(faq.faqid)
                          }}
                          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10"
                        >
                          <span className="material-symbols-outlined text-gray-400">delete</span>
                        </button>
                        <button
                          className={`flex items-center justify-center w-10 h-10 rounded-full transition-transform ${
                            activeAccordion === faq.faqid ? 'rotate-180' : ''
                          }`}
                        >
                          <span className="material-symbols-outlined">expand_more</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* 수정 모달 */}
      {showEditPopup && currentFaq && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditPopup(false)
          }}
        >
          <div className="bg-surface-dark rounded-lg shadow-xl w-full max-w-lg m-4">
            <div className="p-6 border-b border-border-dark">
              <h2 className="text-xl font-semibold">질문 수정</h2>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {/* 카테고리 입력 (자동완성) */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-gray-400" htmlFor="edit-category">
                  카테고리
                </label>
                <input
                  className="w-full rounded-md border-border-dark bg-background-dark px-4 py-2 text-text-light placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                  id="edit-category"
                  placeholder="카테고리를 입력하거나 선택하세요"
                  type="text"
                  value={editFaq.faqcategory}
                  onChange={(e) => setEditFaq({ ...editFaq, faqcategory: e.target.value })}
                  onFocus={() => setShowEditCategorySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowEditCategorySuggestions(false), 200)}
                />
                {showEditCategorySuggestions && filteredEditCategories.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-gray-700 border border-border-dark rounded-md mt-1 z-10 max-h-40 overflow-y-auto">
                    {filteredEditCategories.map((cat) => (
                      <div
                        key={cat}
                        onClick={() => {
                          setEditFaq({ ...editFaq, faqcategory: cat })
                          setShowEditCategorySuggestions(false)
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-primary/20"
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 질문 입력 */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-400" htmlFor="edit-question">
                  질문
                </label>
                <textarea
                  className="w-full rounded-md border-border-dark bg-background-dark px-4 py-2 text-text-light placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                  id="edit-question"
                  placeholder="질문을 입력하세요."
                  rows="2"
                  value={editFaq.faqquestion}
                  onChange={(e) => setEditFaq({ ...editFaq, faqquestion: e.target.value })}
                />
              </div>

              {/* 답변 입력 */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-400" htmlFor="edit-answer">
                  답변
                </label>
                <textarea
                  className="w-full rounded-md border-border-dark bg-background-dark px-4 py-2 text-text-light placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                  id="edit-answer"
                  placeholder="답변을 입력하세요."
                  rows="4"
                  value={editFaq.faqanswer}
                  onChange={(e) => setEditFaq({ ...editFaq, faqanswer: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 p-6 border-t border-border-dark">
              <button
                onClick={() => setShowEditPopup(false)}
                className="px-6 py-2 rounded-lg text-sm font-bold bg-gray-700 text-text-light hover:bg-opacity-80"
              >
                취소
              </button>
              <button
                onClick={handleUpdateFaq}
                className="px-6 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-opacity-80"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
  </main>
  )
}


