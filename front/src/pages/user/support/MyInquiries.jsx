import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../../../lib/api'

function MyInquiries() {
    const navigate = useNavigate()
    const [inquiries, setInquiries] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // 문의 목록 로드
    const loadInquiries = async (page = 0) => {
        try {
            setLoading(true)
            const response = await get(`/api/users/me/inquiries?page=${page}&size=10`)
            
            if (!response.ok) {
                throw new Error('문의 목록을 불러올 수 없습니다.')
            }
            
            const data = await response.json()
            setInquiries(data.content || [])
            setTotalPages(data.totalPages || 0)
            setCurrentPage(page)
        } catch (error) {
            console.error('문의 목록 로드 실패:', error)
            setInquiries([])
            setTotalPages(0)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadInquiries()
    }, [])

    // 날짜 포맷
    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('ko-KR')
    }

    // 답변 상태 확인
    const hasAnswer = (inquiry) => {
        return inquiry.answer && inquiry.answer.answerid
    }

    return (
        <div>
            <main className="p-10 min-h-screen bg-background-dark">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-4xl font-bold tracking-tight text-white">1:1 문의</h2>
                    <button
                        onClick={() => navigate('/user/support/inquiries/new')}
                        className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-background-dark transition-colors hover:bg-primary/90"
                    >
                        문의 등록하기
                    </button>
                </div>

                {/* 문의 목록 테이블 */}
                <div className="overflow-hidden rounded-lg border border-primary/20 bg-black/20">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary/20">
                                <th className="w-32 px-6 py-4 text-left text-sm font-semibold text-primary">상태</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">제목</th>
                                <th className="w-40 px-6 py-4 text-left text-sm font-semibold text-primary">등록일</th>
                                <th className="w-40 px-6 py-4 text-left text-sm font-semibold text-primary">마지막 답변 날짜</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                                        로딩 중...
                                    </td>
                                </tr>
                            ) : inquiries.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                                        등록된 문의가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                inquiries.map((inquiry) => (
                                    <tr
                                        key={inquiry.qid}
                                        onClick={() => navigate(`/user/support/inquiries/${inquiry.qid}`)}
                                        className="cursor-pointer border-b border-primary/20 transition-colors hover:bg-primary/5"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {hasAnswer(inquiry) ? (
                                                inquiry.answer.updatedate !== inquiry.answer.createdate ? (
                                                    <span className="inline-block w-20 text-center rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                                                        답변수정됨
                                                    </span>
                                                ) : (
                                                    <span className="inline-block w-20 text-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                                                        답변완료
                                                    </span>
                                                )
                                            ) : (
                                                <span className="inline-block w-20 text-center rounded-full bg-gray-600 px-3 py-1 text-xs font-medium text-gray-200">
                                                    답변대기
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white">
                                            <div className="flex items-center gap-2">
                                                <span>{inquiry.qtitle}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {formatDate(inquiry.qcreatedate)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {hasAnswer(inquiry) ? formatDate(inquiry.answer.updatedate) : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 페이지네이션 */}
                {totalPages > 0 && (
                    <div className="mt-8 flex items-center justify-center">
                        <nav className="inline-flex -space-x-px rounded-md shadow-sm">
                            <button
                                onClick={() => loadInquiries(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                                className="relative inline-flex items-center rounded-l-md bg-black/20 px-2 py-2 text-sm font-medium text-gray-400 hover:bg-primary/20 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Previous</span>
                                <span className="material-symbols-outlined !text-base">chevron_left</span>
                            </button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => loadInquiries(index)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                        currentPage === index
                                            ? 'z-10 border border-primary bg-primary text-black'
                                            : 'bg-black/20 text-gray-300 hover:bg-primary/20 hover:text-primary'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => loadInquiries(Math.min(totalPages - 1, currentPage + 1))}
                                disabled={currentPage === totalPages - 1}
                                className="relative inline-flex items-center rounded-r-md bg-black/20 px-2 py-2 text-sm font-medium text-gray-400 hover:bg-primary/20 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Next</span>
                                <span className="material-symbols-outlined !text-base">chevron_right</span>
                            </button>
                        </nav>
                    </div>
                )}
            </main>
        </div>
    )
}

export default MyInquiries