import { useState, useEffect } from 'react'
import { getMyInquiries, createInquiry } from '../../../lib/api'
import LeftSidebar from '../../../components/LeftSidebar'

const MyInquiries = () => {
    const [inquiries, setInquiries] = useState([])
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [loading, setLoading] = useState(true)
    const [showNewModal, setShowNewModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedInquiry, setSelectedInquiry] = useState(null)
    
    // 새 문의 작성 폼
    const [newInquiry, setNewInquiry] = useState({
        qtitle: '',
        qcontent: '',
        qissecret: false
    })

    // 문의 목록 로드
    const loadInquiries = async (page = 0) => {
        try {
            setLoading(true)
            const response = await getMyInquiries(page, 10)
            setInquiries(response.content || [])
            setTotalPages(response.totalPages || 0)
            setCurrentPage(page)
        } catch (error) {
            console.error('문의 목록 로드 실패:', error)
            alert('문의 목록을 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadInquiries()
    }, [])

    // 문의 상세 보기
    const handleViewInquiry = (inquiry) => {
        setSelectedInquiry(inquiry)
        setShowDetailModal(true)
    }

    // 새 문의 등록
    const handleCreateInquiry = async () => {
        if (!newInquiry.qtitle.trim()) {
            alert('제목을 입력해주세요.')
            return
        }
        if (!newInquiry.qcontent.trim()) {
            alert('내용을 입력해주세요.')
            return
        }

        try {
            await createInquiry(newInquiry)
            alert('문의가 등록되었습니다.')
            setShowNewModal(false)
            setNewInquiry({ qtitle: '', qcontent: '', qissecret: false })
            loadInquiries(0)
        } catch (error) {
            console.error('문의 등록 실패:', error)
            alert('문의 등록에 실패했습니다.')
        }
    }

    // 날짜 포맷
    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('ko-KR')
    }

    // 답변 상태 확인
    const hasAnswer = (inquiry) => {
        return inquiry.answer && inquiry.answer.answerid
    }

    // 답변 확인 여부
    const isAnswerRead = (inquiry) => {
        return hasAnswer(inquiry) && inquiry.answer.updatedate
    }

    return (
        <div className="flex min-h-screen bg-background-dark">
            {/* 왼쪽 사이드바 */}
            <LeftSidebar />

            {/* 메인 컨텐츠 */}
            <main className="flex-1 p-10">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-4xl font-bold tracking-tight text-white">1:1 문의</h2>
                    <button
                        onClick={() => setShowNewModal(true)}
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
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                        로딩 중...
                                    </td>
                                </tr>
                            ) : inquiries.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                        등록된 문의가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                inquiries.map((inquiry) => (
                                    <tr
                                        key={inquiry.qid}
                                        onClick={() => handleViewInquiry(inquiry)}
                                        className="cursor-pointer border-b border-primary/20 transition-colors hover:bg-primary/5"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {hasAnswer(inquiry) ? (
                                                inquiry.answer.updatedate !== inquiry.answer.createdate ? (
                                                    <span className="inline-block w-20  text-center rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
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
                                        <td className="px-6 py-4 text-sm text-gray-400">{formatDate(inquiry.qcreatedate)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
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

            {/* 상세 보기 모달 */}
            {showDetailModal && selectedInquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-background-dark p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-white">문의 내용 확인</h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-primary"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-primary">문의 제목</label>
                                <p className="rounded-lg border border-primary/20 bg-black/20 p-4 text-white">
                                    {selectedInquiry.qtitle}
                                </p>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-primary">문의 내용</label>
                                <div className="rounded-lg border border-primary/20 bg-black/20 p-4">
                                    <p className="min-h-[100px] text-gray-300 whitespace-pre-wrap">
                                        {selectedInquiry.qcontent}
                                    </p>
                                    <p className="mt-2 text-right text-xs text-gray-500">
                                        등록일: {formatDate(selectedInquiry.qcreatedate)}
                                    </p>
                                </div>
                            </div>
                            {hasAnswer(selectedInquiry) ? (
                                <div className="rounded-lg border border-primary/20 bg-black/20 p-6">
                                    <h4 className="mb-4 text-lg font-semibold text-primary">답변 내용</h4>
                                    <p className="mb-4 text-gray-300 whitespace-pre-wrap">
                                        {selectedInquiry.answer.answer}
                                    </p>
                                    <div className="mt-4 text-right text-sm text-gray-400">
                                        <p>답변 작성자: {selectedInquiry.answer.trainername} 트레이너</p>
                                        <div className="flex items-center justify-end gap-2">
                                            <p>답변일: {formatDate(selectedInquiry.answer.createdate)}</p>
                                            {selectedInquiry.answer.updatedate !== selectedInquiry.answer.createdate && (
                                                <span className="text-xs text-yellow-400">(수정됨)</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-gray-600 bg-black/20 p-6 text-center">
                                    <p className="text-gray-400">
                                        아직 답변이 등록되지 않았습니다. <br />
                                        빠른 시일 내에 답변 드리겠습니다.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="mt-8 flex justify-end gap-4">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="rounded-lg bg-gray-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-500"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 새 문의 등록 모달 */}
            {showNewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-2xl rounded-xl ring-1 ring-primary/30 bg-background-dark p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-white">새 문의 등록</h3>
                            <button
                                onClick={() => setShowNewModal(false)}
                                className="text-gray-400 hover:text-primary"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-primary" htmlFor="inquiry-title">
                                    제목
                                </label>
                                <input
                                    className="w-full rounded-lg border border-primary/20 bg-black/20 p-3 text-white focus:border-primary focus:ring-primary/50"
                                    id="inquiry-title"
                                    placeholder="제목을 입력하세요"
                                    type="text"
                                    value={newInquiry.qtitle}
                                    onChange={(e) => setNewInquiry({ ...newInquiry, qtitle: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-primary" htmlFor="inquiry-content">
                                    문의 내용
                                </label>
                                <textarea
                                    className="w-full min-h-[150px] rounded-lg border border-primary/20 bg-black/20 p-3 text-white focus:border-primary focus:ring-primary/50"
                                    id="inquiry-content"
                                    placeholder="문의하실 내용을 자세하게 입력해주세요."
                                    value={newInquiry.qcontent}
                                    onChange={(e) => setNewInquiry({ ...newInquiry, qcontent: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-4">
                            <button
                                onClick={() => setShowNewModal(false)}
                                className="rounded-lg bg-gray-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-500"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCreateInquiry}
                                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-background-dark transition-colors hover:bg-primary/90"
                            >
                                등록하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyInquiries

