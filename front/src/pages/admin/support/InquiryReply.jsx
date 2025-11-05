import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getInquiry, createAnswer, updateAnswer } from '../../../lib/api'
import LeftSidebar from '../../../components/LeftSidebar'

export default function InquiryReply() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [inquiry, setInquiry] = useState(null)
  const [answerContent, setAnswerContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadInquiry()
  }, [id])

  const loadInquiry = async () => {
    setLoading(true)
    try {
      const response = await getInquiry(id)
      
      // Jackson 소문자 변환 규칙 적용하여 데이터 매핑
      const mappedData = {
        id: response.qid,
        username: response.username || '알 수 없음',
        userid: response.useremail || '',
        questiondate: formatDateTime(response.qcreatedate),
        title: response.qtitle,
        content: response.qcontent,
        status: response.answer ? 'answered' : 'unanswered',
        answer: response.answer ? {
          content: response.answer.answer,
          author: response.answer.trainername,
          answerdate: formatDateTime(response.answer.createdate)
        } : null
      }

      setInquiry(mappedData)
      
      // 답변이 이미 있으면 내용 설정
      if (mappedData.answer) {
        setAnswerContent(mappedData.answer.content)
      }
    } catch (error) {
      console.error('문의 상세 로드 실패:', error)
      alert('문의 정보를 불러올 수 없습니다: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!answerContent.trim()) {
      alert('답변 내용을 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      if (inquiry.status === 'answered') {
        // 수정
        await updateAnswer(id, answerContent)
        alert('답변이 수정되었습니다.')
      } else {
        // 신규 등록
        await createAnswer(id, answerContent)
        alert('답변이 등록되었습니다.')
      }

      navigate(-1) // 이전 페이지로
    } catch (error) {
      console.error('답변 저장 실패:', error)
      alert('답변 저장에 실패했습니다: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (answerContent.trim() && !confirm('작성 중인 내용이 있습니다. 취소하시겠습니까?')) {
      return
    }
    navigate(-1)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background-dark">
        <LeftSidebar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 bg-background-dark font-display text-text-light">
          <div className="text-center py-12 text-gray-400">로딩 중...</div>
        </main>
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div className="flex min-h-screen bg-background-dark">
        <LeftSidebar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 bg-background-dark font-display text-text-light">
          <div className="text-center py-12 text-gray-400">문의를 찾을 수 없습니다.</div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background-dark">
      <LeftSidebar />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 bg-background-dark font-display text-text-light">
        <div className="flex flex-col max-w-2xl mx-auto gap-8">
          {/* 헤더 */}
          <div className="flex flex-col gap-2 items-center">
            <h1 className="text-3xl font-bold text-center">
              {inquiry.status === 'answered' ? '1:1 문의 답변 수정' : '1:1 문의 답변 등록'}
            </h1>
            <p className="text-gray-400 text-center">회원의 문의에 답변을 등록합니다.</p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit}>
            <div className="bg-surface-light border border-gray-700 rounded-lg p-6 sm:p-8 space-y-6">
              {/* 질문 정보 */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">질문자:</span>
                    <span className="text-gray-400">{inquiry.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                    <span>{inquiry.questiondate}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="question-title">
                    문의 제목
                  </label>
                  <div className="w-full rounded-md border-gray-700 bg-gray-950 px-3 py-2 text-white">
                    {inquiry.title}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="question-content">
                    문의 내용
                  </label>
                  <div className="w-full rounded-md border-gray-700 bg-gray-950 px-3 py-2 text-white min-h-[100px] whitespace-pre-wrap">
                    {inquiry.content}
                  </div>
                </div>
              </div>

              {/* 구분선 */}
              <div className="border-t border-gray-700"></div>

              {/* 답변 입력 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1" htmlFor="answer-content">
                    답변 내용
                  </label>
                  <textarea
                    id="answer-content"
                    name="answer-content"
                    rows="6"
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    placeholder="답변 내용을 입력하세요."
                    className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white placeholder-gray-500
                      focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none
                      transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="flex items-center justify-center h-10 px-6 text-sm font-bold rounded-md bg-gray-600 text-white hover:bg-gray-500 whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center h-10 px-6 text-sm font-bold text-white rounded-md bg-primary hover:bg-primary/80 whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting 
                    ? '저장 중...' 
                    : inquiry.status === 'answered' ? '답변 수정' : '답변 등록'
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

