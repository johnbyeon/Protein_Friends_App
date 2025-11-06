import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getInquiry } from '../../../lib/api'

function InquiryDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [inquiry, setInquiry] = useState(null)
    const [loading, setLoading] = useState(true)

    // 문의 상세 정보 로드
    const loadInquiryDetail = async () => {
        try {
            setLoading(true)
            const response = await getInquiry(id)
            setInquiry(response.data)
        } catch (error) {
            console.error('문의 상세 정보 로드 실패:', error)
            alert('문의 정보를 불러오는데 실패했습니다.')
            navigate('/user/support/inquiries')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            loadInquiryDetail()
        }
    }, [id])

    // 날짜 포맷
    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('ko-KR')
    }

    // 답변 상태 확인
    const hasAnswer = (inquiry) => {
        return inquiry.answer && inquiry.answer.answerid
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-dark">
                <div className="text-gray-400">로딩 중...</div>
            </div>
        )
    }

    if (!inquiry) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-dark">
                <div className="text-gray-400">문의를 찾을 수 없습니다.</div>
            </div>
        )
    }

    return (
        <div>
            <main className="p-10 min-h-screen bg-background-dark">
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/user/support/inquiries')}
                        className="mb-4 flex items-center gap-2 text-gray-400 hover:text-primary"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        목록으로 돌아가기
                    </button>
                    <h2 className="text-4xl font-bold tracking-tight text-white">문의 상세</h2>
                </div>

                <div className="space-y-6">
                    {/* 문의 정보 */}
                    <div className="rounded-lg border border-primary/20 bg-black/20 p-6">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white mb-4">{inquiry.qtitle}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>등록일: {formatDate(inquiry.qcreatedate)}</span>
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                    hasAnswer(inquiry) 
                                        ? 'bg-primary/20 text-primary' 
                                        : 'bg-gray-600 text-gray-200'
                                }`}>
                                    {hasAnswer(inquiry) ? '답변완료' : '답변대기'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="mb-2 text-lg font-semibold text-primary">문의 내용</h4>
                                <div className="rounded-lg border border-primary/20 bg-black/20 p-4">
                                    <p className="min-h-[100px] text-gray-300 whitespace-pre-wrap">
                                        {inquiry.qcontent}
                                    </p>
                                </div>
                            </div>

                            {/* 답변 내용 */}
                            {hasAnswer(inquiry) && (
                                <div className="rounded-lg border border-primary/20 bg-black/20 p-6">
                                    <h4 className="mb-4 text-lg font-semibold text-primary">답변 내용</h4>
                                    <p className="mb-4 text-gray-300 whitespace-pre-wrap">
                                        {inquiry.answer.answer}
                                    </p>
                                    <div className="mt-4 text-right text-sm text-gray-400">
                                        <p>답변 작성자: {inquiry.answer.trainername} 트레이너</p>
                                        <div className="flex items-center justify-end gap-2">
                                            <p>답변일: {formatDate(inquiry.answer.createdate)}</p>
                                            {inquiry.answer.updatedate !== inquiry.answer.createdate && (
                                                <span className="text-xs text-yellow-400">(수정됨)</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!hasAnswer(inquiry) && (
                                <div className="rounded-lg border border-dashed border-gray-600 bg-black/20 p-6 text-center">
                                    <p className="text-gray-400">
                                        아직 답변이 등록되지 않았습니다.<br />
                                        빠른 시일 내에 답변 드리겠습니다.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => navigate('/user/support/inquiries')}
                            className="rounded-lg bg-gray-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-500"
                        >
                            목록으로
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default InquiryDetail