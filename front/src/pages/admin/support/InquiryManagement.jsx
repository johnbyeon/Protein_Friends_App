import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getInquiries, getUnansweredCount, getAnsweredCount } from '../../../lib/api'
import LeftSidebar from '../../../components/LeftSidebar'

export default function InquiryManagement() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('unanswered') // 'unanswered' or 'answered'
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [unansweredCount, setUnansweredCount] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)

  useEffect(() => {
    loadInquiries()
    loadCounts()
  }, [activeTab])

  const loadInquiries = async () => {
    setLoading(true)
    try {
      const result = await getInquiries(activeTab, 0, 50)
      
      // Jackson 소문자 변환 규칙 적용하여 데이터 매핑
      const mappedData = result.content.map(item => ({
        id: item.qid,
        username: item.username || '알 수 없음',
        userid: item.useremail || '',
        questiondate: formatDate(item.qcreatedate),
        status: item.answer ? 'answered' : 'unanswered',
        title: item.qtitle,
        content: item.qcontent,
        answer: item.answer ? {
          content: item.answer.answer,
          author: item.answer.trainername,
          answerdate: formatDate(item.answer.createdate)
        } : null
      }))
      
      setInquiries(mappedData)
    } catch (error) {
      console.error('문의 목록 로드 실패:', error)
      alert('문의 목록을 불러올 수 없습니다: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCounts = async () => {
    try {
      const [unanswered, answered] = await Promise.all([
        getUnansweredCount(),
        getAnsweredCount()
      ])
      setUnansweredCount(unanswered)
      setAnsweredCount(answered)
    } catch (error) {
      console.error('카운트 로드 실패:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\. /g, '.').replace(/\.$/, '')
  }

  const handleAnswer = (inquiryId) => {
    const basePath = location.pathname.startsWith('/admin') ? '/admin' : '/trainer'
    navigate(`${basePath}/support/inquiries/${inquiryId}/reply`)
  }

  return (
    <div className="flex min-h-screen bg-background-dark">
      <LeftSidebar />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 bg-background-dark font-display text-text-light">
        <div className="flex flex-col max-w-7xl mx-auto gap-8">
          {/* 헤더 */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">1:1 문의 관리</h1>
            <p className="text-gray-400">회원들의 1:1 질문에 답변하고 관리합니다.</p>
          </div>

          {/* 탭 */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('unanswered')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'unanswered'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              미답변 질문 ({unansweredCount})
            </button>
            <button
              onClick={() => setActiveTab('answered')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'answered'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              답변 완료 질문 ({answeredCount})
            </button>
          </div>

          {/* 문의 목록 */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">로딩 중...</div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {activeTab === 'unanswered' ? '미답변 문의가 없습니다.' : '답변 완료된 문의가 없습니다.'}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className={`flex flex-col gap-4 p-6 rounded-lg bg-surface-light border ${
                    inquiry.status === 'unanswered'
                      ? 'border-yellow-500/50'
                      : 'border-green-500/50'
                  }`}
                >
                  {/* 질문 영역 */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex flex-col gap-4 flex-1">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>질문자: {inquiry.username} ({inquiry.userid})</span>
                            <span>|</span>
                            <span>질문 일자: {inquiry.questiondate}</span>
                            <span>|</span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                inquiry.status === 'unanswered'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-green-500/20 text-green-400'
                              }`}
                            >
                              {inquiry.status === 'unanswered' ? '미답변' : '답변 완료'}
                            </span>
                          </div>
                          <h2 className="text-lg font-semibold text-white mt-3">{inquiry.title}</h2>
                        </div>
                        <p className="text-base text-gray-400 mt-1">{inquiry.content}</p>
                      </div>
                      <button
                        onClick={() => handleAnswer(inquiry.id)}
                        className={`flex items-center justify-center h-10 px-4 text-sm font-bold rounded-md whitespace-nowrap mt-2 sm:mt-0 transition-colors ${
                          inquiry.status === 'unanswered'
                            ? 'text-white bg-primary hover:bg-primary/80'
                            : 'bg-gray-600 text-white hover:bg-gray-500'
                        }`}
                      >
                        {inquiry.status === 'unanswered' ? '답변하기' : '수정하기'}
                      </button>
                    </div>

                    {/* 답변 영역 (답변 완료인 경우만) */}
                    {inquiry.status === 'answered' && inquiry.answer && (
                      <div className="p-4 mt-4 bg-[#2D3748] rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-base font-bold text-green-400">답변 완료</p>
                          <p className="text-xs text-gray-400">작성자: {inquiry.answer.author}</p>
                        </div>
                        <p className="text-sm text-white">{inquiry.answer.content}</p>
                        <p className="text-xs text-gray-400 mt-2">답변 일자: {inquiry.answer.answerdate}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

