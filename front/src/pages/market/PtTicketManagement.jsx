import React, { useState, useEffect } from 'react'
import { getPtTickets, createPtTicket, updatePtTicket, deletePtTicket, presignUpload, getViewUrl } from '../../lib/api'

// 이미지 컴포넌트
const S3Image = ({ imageKey, alt, className, onError }) => {
  const [imageUrl, setImageUrl] = useState('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjQwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb2FkaW5nLi4uPC90ZXh0Pgo8L3N2Zz4=')
  const [loading, setLoading] = useState(true)

  console.log('🔍 S3Image 렌더링:', { imageKey, alt })

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true)
        console.log('🔍 이미지 URL 요청:', imageKey)
        const url = await getViewUrl(imageKey)
        console.log('🔍 받은 이미지 URL:', url)
        setImageUrl(url)
      } catch (error) {
        console.error('이미지 로드 실패:', error)
        setImageUrl('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjQwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+')
      } finally {
        setLoading(false)
      }
    }

    if (imageKey) {
      loadImage()
    }
  }, [imageKey])

  console.log('🔍 최종 imageUrl:', imageUrl)
  
  return (
    <img 
      src={imageUrl}
      alt={alt} 
      className={className}
      onError={(e) => {
        console.error('이미지 로드 에러:', e.target.src)
        if (onError) onError(e)
      }}
    />
  )
}

export default function PtTicketManagement() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTicket, setEditingTicket] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)


  // 폼 상태
  const [formData, setFormData] = useState({
    ptName: '',
    ptCount: '',
    ptDurationDays: '',
    ptPrice: '',
    ptSalePrice: '0',
    ptPicUrl: '',
    isActive: true
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const data = await getPtTickets()
      console.log('🔍 받은 데이터:', data)
      setTickets(data || [])
    } catch (error) {
      console.error('PT 이용권 목록 조회 실패:', error)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다.')
      return
    }

    // 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    try {
      setUploadingImage(true)
      
      // S3 Presigned URL 발급
      const { key, putUrl } = await presignUpload({
        filename: file.name,
        contentType: file.type,
        contentLength: file.size,
        description: `PT 이용권 이미지: ${formData.ptName}`,
        imageType: 'PT_TICKET'
      })

      // S3에 직접 업로드
      const response = await fetch(putUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file
      })

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.')
      }

      // 업로드된 이미지 URL 저장
      setFormData(prev => ({
        ...prev,
        ptPicUrl: key
      }))

      alert('이미지가 성공적으로 업로드되었습니다.')
    } catch (error) {
      console.error('이미지 업로드 실패:', error)
      alert('이미지 업로드에 실패했습니다: ' + error.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const resetForm = () => {
    setFormData({
      ptName: '',
      ptCount: '',
      ptDurationDays: '',
      ptPrice: '',
      ptSalePrice: '0',
      ptPicUrl: '',
      isActive: true
    })
  }

  const handleAddTicket = async () => {
    if (!formData.ptName || !formData.ptCount || !formData.ptDurationDays || !formData.ptPrice) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    const ptPrice = parseInt(formData.ptPrice)
    const ptSalePrice = parseInt(formData.ptSalePrice)
    
    if (ptSalePrice > ptPrice) {
      alert('할인가는 등록가보다 클 수 없습니다.')
      return
    }

    try {
      setSubmitting(true)
      const ticketData = {
        ptName: formData.ptName,
        ptCount: parseInt(formData.ptCount),
        ptDurationDays: parseInt(formData.ptDurationDays),
        ptPrice: ptPrice,
        ptSalePrice: ptSalePrice,
        ptPicUrl: formData.ptPicUrl,
        isActive: formData.isActive
      }

      console.log('🔍 보내는 데이터:', ticketData)
      await createPtTicket(ticketData)
      alert('PT 이용권이 성공적으로 등록되었습니다.')
      setShowAddModal(false)
      resetForm()
      fetchTickets()
    } catch (error) {
      console.error('PT 이용권 등록 실패:', error)
      alert('PT 이용권 등록에 실패했습니다: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditTicket = async () => {
    if (!formData.ptName || !formData.ptCount || !formData.ptDurationDays || !formData.ptPrice) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    const ptPrice = parseInt(formData.ptPrice)
    const ptSalePrice = parseInt(formData.ptSalePrice)
    
    if (ptSalePrice > ptPrice) {
      alert('할인가는 등록가보다 클 수 없습니다.')
      return
    }

    try {
      setSubmitting(true)
      const ticketData = {
        ptName: formData.ptName,
        ptCount: parseInt(formData.ptCount),
        ptDurationDays: parseInt(formData.ptDurationDays),
        ptPrice: ptPrice,
        ptSalePrice: ptSalePrice,
        ptPicUrl: formData.ptPicUrl,
        isActive: formData.isActive
      }

      console.log('🔍 수정 데이터:', ticketData)
      await updatePtTicket(editingTicket.ptId, ticketData)
      alert('PT 이용권이 성공적으로 수정되었습니다.')
      setShowEditModal(false)
      setEditingTicket(null)
      resetForm()
      fetchTickets()
    } catch (error) {
      console.error('PT 이용권 수정 실패:', error)
      alert('PT 이용권 수정에 실패했습니다: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTicket = async (ticketId) => {
    if (!confirm('정말로 이 PT 이용권을 삭제하시겠습니까?')) {
      return
    }

    try {
      await deletePtTicket(ticketId)
      alert('PT 이용권이 성공적으로 삭제되었습니다.')
      fetchTickets()
    } catch (error) {
      console.error('PT 이용권 삭제 실패:', error)
      alert('PT 이용권 삭제에 실패했습니다: ' + error.message)
    }
  }

  const openEditModal = (ticket) => {
    setEditingTicket(ticket)
    setFormData({
      ptName: ticket.ptName,
      ptCount: ticket.ptCount.toString(),
      ptDurationDays: ticket.ptDurationDays.toString(),
      ptPrice: ticket.ptPrice.toString(),
      ptSalePrice: ticket.ptSalePrice.toString(),
      ptPicUrl: ticket.ptPicUrl || '',
      isActive: ticket.isActive
    })
    setShowEditModal(true)
  }

  const filteredTickets = (tickets || []).filter(ticket =>
    ticket.ptName.toLowerCase().includes(searchTerm.toLowerCase())
  )



  const getStatusBadge = (isActive) => {
    if (isActive) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900 text-green-300">판매중</span>
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-900 text-red-300">판매중지</span>
    }
  }

  const finalPrice = parseFloat(formData.ptPrice || 0) - parseFloat(formData.ptSalePrice || 0)

  return (
    <div className="flex min-h-screen flex-col bg-background-dark text-text-light">
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto w-full max-w-7xl space-y-8">
          <header>
            <p className="text-sm uppercase tracking-widest text-primary/80">Market Management</p>
            <h1 className="text-3xl font-bold text-text-light">PT 이용권 관리</h1>
            <p className="mt-2 text-sm text-gray-400">
              PT 이용권 목록 및 정보를 관리합니다.
            </p>
          </header>

          {/* 검색 및 버튼 */}
          <div className="rounded-2xl border border-border-dark/60 bg-background-dark/60 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="이용권 이름으로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 pl-10 pr-4 py-2.5 text-base text-text-light placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-border-dark/60 hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-base">filter_list</span>
                  필터
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary text-white flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  이용권 추가
                </button>
              </div>
            </div>
          </div>

          {/* 테이블 */}
          <div className="rounded-2xl border border-border-dark/60 bg-background-dark/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-background-dark/80 border-b border-border-dark/60">
                  <tr>
                    <th className="px-6 py-3">번호</th>
                    <th className="px-6 py-3">이미지</th>
                    <th className="px-6 py-3">이름</th>
                    <th className="px-6 py-3">이용 가능 횟수</th>
                    <th className="px-6 py-3">유효 기간</th>
                    <th className="px-6 py-3">가격</th>
                    <th className="px-6 py-3">할인 금액</th>
                    <th className="px-6 py-3">판매가</th>
                    <th className="px-6 py-3">판매 상태</th>
                    <th className="px-6 py-3">생성일</th>
                    <th className="px-6 py-3">수정일</th>
                    <th className="px-6 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark/60">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center text-gray-400">
                        로딩 중...
                      </td>
                    </tr>
                  ) : filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center text-gray-400">
                        {searchTerm ? '검색 결과가 없습니다.' : '등록된 PT 이용권이 없습니다.'}
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket, index) => (
                      <tr key={ticket.ptId} className="hover:bg-background-dark/40">
                        <td className="px-6 py-4 text-text-light">{index + 1}</td>
                        <td className="px-6 py-4 text-text-light">
                          {ticket.ptPicUrl && (
                            <S3Image 
                              key={ticket.ptPicUrl}
                              imageKey={ticket.ptPicUrl}
                              alt={ticket.ptName} 
                              className="h-12 w-12 object-cover rounded-lg border border-border-dark/60"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjI0IiB5PSIyOCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4='
                              }}
                            />
                          )}
                        </td>
                        <td className="px-6 py-4 text-text-light font-medium">{ticket.ptName}</td>
                        <td className="px-6 py-4 text-text-light">{ticket.ptCount}회</td>
                        <td className="px-6 py-4 text-text-light">{ticket.ptDurationDays}일</td>
                        <td className="px-6 py-4 text-text-light">₩{ticket.ptPrice.toLocaleString()}</td>
                        <td className="px-6 py-4 text-primary">
                          {ticket.ptSalePrice > 0 ? `-₩${ticket.ptSalePrice.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-text-light font-bold">
                          ₩{(ticket.ptPrice - ticket.ptSalePrice).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(ticket.isActive)}</td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(ticket.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(ticket.updateAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(ticket)}
                              className="text-text-light hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTicket(ticket.ptId)}
                              className="text-text-light hover:text-red-400 transition-colors"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
          <div className="bg-background-dark/90 rounded-xl shadow-xl w-full max-w-2xl p-8 m-4 border border-border-dark/60">
            <h3 className="text-2xl font-bold text-text-light mb-6">PT 이용권 추가</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">이용권 이름</label>
                  <input
                    type="text"
                    value={formData.ptName}
                    onChange={(e) => setFormData({ ...formData, ptName: e.target.value })}
                    className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5 text-base text-text-light focus:border-primary focus:ring-primary"
                    placeholder="예: PT 10회 이용권"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">이용 가능 횟수</label>
                  <input
                    type="number"
                    value={formData.ptCount}
                    onChange={(e) => setFormData({ ...formData, ptCount: e.target.value })}
                    className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5 text-base text-text-light focus:border-primary focus:ring-primary"
                    placeholder="예: 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">유효 기간 (일)</label>
                  <input
                    type="number"
                    value={formData.ptDurationDays}
                    onChange={(e) => setFormData({ ...formData, ptDurationDays: e.target.value })}
                    className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5 text-base text-text-light focus:border-primary focus:ring-primary"
                    placeholder="예: 30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">이용권 이미지</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5 text-base text-text-light focus:border-primary focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/80 disabled:opacity-50"
                  />
                  {uploadingImage && (
                    <p className="mt-2 text-sm text-primary">업로드 중...</p>
                  )}
                  {formData.ptPicUrl && (
                    <div className="mt-2">
                      <S3Image 
                        key={formData.ptPicUrl}
                        imageKey={formData.ptPicUrl}
                        alt="PT 이용권 이미지" 
                        className="h-20 w-20 object-cover rounded-lg border border-border-dark/60"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjQwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">이용권 가격 (원)</label>
                  <input
                    type="number"
                    value={formData.ptPrice}
                    onChange={(e) => setFormData({ ...formData, ptPrice: e.target.value })}
                    className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5 text-base text-text-light focus:border-primary focus:ring-primary"
                    placeholder="예: 500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">할인 금액 (원)</label>
                  <input
                    type="number"
                    value={formData.ptSalePrice}
                    onChange={(e) => setFormData({ ...formData, ptSalePrice: e.target.value })}
                    className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5 text-base text-text-light focus:border-primary focus:ring-primary"
                    placeholder="예: 50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">최종 판매가 (원)</label>
                  <input
                    type="text"
                    value={`₩${finalPrice.toLocaleString()}`}
                    disabled
                    className="w-full rounded-lg border border-border-dark/60 bg-gray-700/50 px-4 py-2.5 text-base text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">판매 상태</label>
                  <select
                    value={formData.isActive.toString()}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5 text-base text-text-light focus:border-primary focus:ring-primary"
                  >
                    <option value="true">판매중</option>
                    <option value="false">판매중지</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="px-6 py-2.5 text-sm font-semibold text-text-light bg-transparent rounded-lg border border-border-dark/60 hover:bg-gray-800 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddTicket}
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? '처리 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
          <div className="bg-background-dark/90 rounded-xl shadow-xl w-full max-w-2xl p-8 m-4 border border-border-dark/60">
            <h3 className="text-2xl font-bold text-text-light mb-6">PT 이용권 수정</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">이용권 이름</label>
                  <input
                    type="text"
                    value={formData.ptName}
                    onChange={(e) => setFormData({ ...formData, ptName: e.target.value })}
                    className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5 text-base text-text-light focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">이용 가능 횟수</label>
                  <input
                    type="number"
                    value={formData.ptCount}
                    onChange={(e) => setFormData({ ...formData, ptCount: e.target.value })}
                    className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5 text-base text-text-light focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">유효 기간 (일)</label>
                  <input
                    type="number"
                    value={formData.ptDurationDays}
                    onChange={(e) => setFormData({ ...formData, ptDurationDays: e.target.value })}
                    className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5 text-base text-text-light focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">이용권 이미지</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5 text-base text-text-light focus:border-primary focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/80 disabled:opacity-50"
                  />
                  {uploadingImage && (
                    <p className="mt-2 text-sm text-primary">업로드 중...</p>
                  )}
                  {formData.ptPicUrl && (
                    <div className="mt-2">
                      <S3Image 
                        key={formData.ptPicUrl}
                        imageKey={formData.ptPicUrl}
                        alt="PT 이용권 이미지" 
                        className="h-20 w-20 object-cover rounded-lg border border-border-dark/60"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjQwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">이용권 가격 (원)</label>
                  <input
                    type="number"
                    value={formData.ptPrice}
                    onChange={(e) => setFormData({ ...formData, ptPrice: e.target.value })}
                    className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5 text-base text-text-light focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">할인 금액 (원)</label>
                  <input
                    type="number"
                    value={formData.ptSalePrice}
                    onChange={(e) => setFormData({ ...formData, ptSalePrice: e.target.value })}
                    className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5 text-base text-text-light focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">최종 판매가 (원)</label>
                  <input
                    type="text"
                    value={`₩${finalPrice.toLocaleString()}`}
                    disabled
                    className="w-full rounded-lg border border-border-dark/60 bg-gray-700/50 px-4 py-2.5 text-base text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">판매 상태</label>
                  <select
                    value={formData.isActive.toString()}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5 text-base text-text-light focus:border-primary focus:ring-primary"
                  >
                    <option value="true">판매중</option>
                    <option value="false">판매중지</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingTicket(null)
                  resetForm()
                }}
                className="px-6 py-2.5 text-sm font-semibold text-text-light bg-transparent rounded-lg border border-border-dark/60 hover:bg-gray-800 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleEditTicket}
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? '처리 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}