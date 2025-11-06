import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createInquiry } from '../../../lib/api'

function NewInquiry() {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        qtitle: '',
        qcontent: '',
        qissecret: false,
        faqcategory: 'MEMBERSHIP'
    })

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.qtitle.trim()) {
            alert('제목을 입력해주세요.')
            return
        }
        
        if (!formData.qcontent.trim()) {
            alert('내용을 입력해주세요.')
            return
        }

        try {
            setIsSubmitting(true)
            await createInquiry(formData)
            alert('문의가 등록되었습니다.')
            navigate('/user/support/inquiries')
        } catch (error) {
            console.error('문의 등록 실패:', error)
            alert('문의 등록에 실패했습니다.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // 취소 핸들러
    const handleCancel = () => {
        if (formData.qtitle.trim() || formData.qcontent.trim()) {
            if (confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
                navigate('/user/support/inquiries')
            }
        } else {
            navigate('/user/support/inquiries')
        }
    }

    return (
        <div>
            <main className="p-10 min-h-screen bg-background-dark">
                <div className="mb-8">
                    <button
                        onClick={handleCancel}
                        className="mb-4 flex items-center gap-2 text-gray-400 hover:text-primary"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        목록으로 돌아가기
                    </button>
                    <h2 className="text-4xl font-bold tracking-tight text-white">1:1 문의 등록</h2>
                </div>

                <div className="mx-auto max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 문의 유형 */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-primary">
                                문의 유형
                            </label>
                            <select
                                name="faqcategory"
                                value={formData.faqcategory}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                                required
                            >
                                <option value="MEMBERSHIP">멤버십 문의</option>
                                <option value="PT">PT 문의</option>
                                <option value="FACILITY">시설 문의</option>
                                <option value="ETC">기타 문의</option>
                            </select>
                        </div>

                        {/* 제목 */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-primary">
                                제목
                            </label>
                            <input
                                type="text"
                                name="qtitle"
                                value={formData.qtitle}
                                onChange={handleChange}
                                placeholder="문의 제목을 입력해주세요"
                                className="w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                                required
                            />
                        </div>

                        {/* 내용 */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-primary">
                                문의 내용
                            </label>
                            <textarea
                                name="qcontent"
                                value={formData.qcontent}
                                onChange={handleChange}
                                placeholder="문의 내용을 상세하게 입력해주세요"
                                rows="8"
                                className="w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                                required
                            />
                        </div>

                        {/* 비밀글 여부 */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="qissecret"
                                name="qissecret"
                                checked={formData.qissecret}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-primary/20 bg-background-dark text-primary focus:ring-primary/30"
                            />
                            <label htmlFor="qissecret" className="text-sm text-gray-300">
                                비밀글로 등록하기
                            </label>
                        </div>

                        {/* 버튼 영역 */}
                        <div className="flex justify-end gap-4 pt-6">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="rounded-lg bg-gray-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-gray-500"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-background-dark transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? '등록 중...' : '등록하기'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default NewInquiry