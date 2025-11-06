import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, post, put, del, presignUpload, getViewUrl } from '../../../lib/api'

const MembershipManagement = () => {
  const navigate = useNavigate()
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMembership, setSelectedMembership] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUrls, setImageUrls] = useState({})

  const [formData, setFormData] = useState({
    membershipName: '',
    membershipDurationDays: '',
    membershipPrice: '',
    membershipSalePrice: '',
    membershipPicUrl: '',
    isActive: true
  })

  const getImageUrl = async (key) => {
    if (!key) return null
    try {
      const url = await getViewUrl(key)
      return url
    } catch {
      return `https://protein-friends-s3.s3.ap-northeast-2.amazonaws.com/${key}`
    }
  }

  const fetchMemberships = async () => {
    try {
      const response = await get('/api/admin/memberships')
      if (response.ok) {
        const data = await response.json()
        setMemberships(data)
        const urls = {}
        for (const membership of data) {
          if (membership.membershipPicUrl) {
            urls[membership.membershipPicUrl] = await getImageUrl(membership.membershipPicUrl)
          }
        }
        setImageUrls(urls)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file) => {
    if (!file) return null
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다.')
      return null
    }
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return null
    }
    try {
      setUploadingImage(true)
      const { key, putUrl } = await presignUpload({
        filename: file.name,
        contentType: file.type,
        contentLength: file.size,
        description: '회원권 이미지',
        imageType: 'MEMBERSHIP'
      })
      const response = await fetch(putUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      })
      if (!response.ok) throw new Error('이미지 업로드 실패')
       const imageUrl = putUrl.split('?')[0]
      setImageUrls(prev => ({ ...prev, [key]: imageUrl }))
      return key
    } catch (e) {
      alert('이미지 업로드 실패: ' + e.message)
    } finally {
      setUploadingImage(false)
    }
    return null
  }

  const handleAddMembership = async (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      membershipDurationDays: parseInt(formData.membershipDurationDays),
      membershipPrice: parseInt(formData.membershipPrice),
      membershipSalePrice: parseInt(formData.membershipSalePrice)
    }
    const response = await post('/api/admin/memberships', payload)
    if (response.ok) {
      setShowAddModal(false)
      resetForm()
      fetchMemberships()
    }
  }

  const handleEditMembership = async (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      membershipDurationDays: parseInt(formData.membershipDurationDays),
      membershipPrice: parseInt(formData.membershipPrice),
      membershipSalePrice: parseInt(formData.membershipSalePrice)
    }
    const response = await put(`/api/admin/memberships/${selectedMembership.membershipId}`, payload)
    if (response.ok) {
      setShowEditModal(false)
      resetForm()
      fetchMemberships()
    }
  }

  const handleDeleteMembership = async (id) => {
    if (!confirm('정말로 삭제하시겠습니까?')) return
    const response = await del(`/api/admin/memberships/${id}`)
    if (response.ok) fetchMemberships()
  }

  const toggleStatus = async (id, isActive) => {
    const response = await fetch(`/api/admin/memberships/${id}/status?isActive=${!isActive}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    if (response.ok) fetchMemberships()
  }

  const resetForm = () => {
    setFormData({
      membershipName: '',
      membershipDurationDays: '',
      membershipPrice: '',
      membershipSalePrice: '',
      membershipPicUrl: '',
      isActive: true
    })
    setSelectedMembership(null)
  }

  const openEditModal = (membership) => {
    setSelectedMembership(membership)
    setFormData({
      membershipName: membership.membershipName,
      membershipDurationDays: membership.membershipDurationDays.toString(),
      membershipPrice: membership.membershipPrice.toString(),
      membershipSalePrice: membership.membershipSalePrice.toString(),
      membershipPicUrl: membership.membershipPicUrl || '',
      isActive: membership.isActive
    })
    setShowEditModal(true)
  }

  const getStatusBadge = (isActive) =>
    isActive
      ? <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900 text-green-300">판매중</span>
      : <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-900 text-red-300">판매중지</span>

  useEffect(() => { fetchMemberships() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const filteredMemberships = memberships.filter(m =>
    m.membershipName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex min-h-screen flex-col bg-background-dark text-text-light">
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto w-full max-w-7xl space-y-8">
          <header>
            <p className="text-sm uppercase tracking-widest text-primary/80">Market Management</p>
            <h1 className="text-3xl font-bold text-text-light">기간제 회원권 관리</h1>
            <p className="mt-2 text-sm text-gray-400">기간제 회원권 목록 및 정보를 관리합니다.</p>
          </header>

          <div className="rounded-2xl border border-border-dark/60 bg-background-dark/60 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  type="text"
                  placeholder="회원권 이름으로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 pl-10 pr-4 py-2.5 text-base text-text-light placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-border-dark/60 hover:bg-primary/20">
                  <span className="material-symbols-outlined text-base">filter_list</span>필터
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary text-white flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-primary/90"
                >
                  <span className="material-symbols-outlined text-base">add</span>회원권 추가
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border-dark/60 bg-background-dark/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-background-dark/80 border-b border-border-dark/60">
                  <tr>
                    <th className="px-6 py-3">번호</th>
                    <th className="px-6 py-3">이미지</th>
                    <th className="px-6 py-3">이름</th>
                    <th className="px-6 py-3">기간</th>
                    <th className="px-6 py-3">가격</th>
                    <th className="px-6 py-3">할인 금액</th>
                    <th className="px-6 py-3">판매가</th>
                    <th className="px-6 py-3">판매 상태</th>
                    <th className="px-6 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark/60">
                  {filteredMemberships.map((m, i) => (
                    <tr key={m.membershipId} className="hover:bg-background-dark/40">
                      <td className="px-6 py-4">{i + 1}</td>
                      <td className="px-6 py-4">
                        {m.membershipPicUrl && imageUrls[m.membershipPicUrl]
                          ? <img src={imageUrls[m.membershipPicUrl]} alt={m.membershipName} className="h-12 w-12 object-cover rounded-lg border border-border-dark/60" />
                          : <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center"><span className="text-gray-400">📷</span></div>}
                      </td>
                      <td className="px-6 py-4 font-medium">{m.membershipName}</td>
                      <td className="px-6 py-4">{m.membershipDurationDays}일</td>
                      <td className="px-6 py-4">₩{m.membershipPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 text-primary">{m.membershipSalePrice > 0 ? `-₩${m.membershipSalePrice.toLocaleString()}` : '-'}</td>
                      <td className="px-6 py-4 font-bold">₩{(m.membershipPrice - m.membershipSalePrice).toLocaleString()}</td>
                      <td className="px-6 py-4">{getStatusBadge(m.isActive)}</td>
                       <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(m)} className="hover:text-primary">
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button onClick={() => handleDeleteMembership(m.membershipId)} className="hover:text-red-400">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div> {/* ← 닫힘 추가 */}
        </div>   {/* ← 닫힘 추가 */}

        {/* 모달들 */}
        {showAddModal && (
          <Modal
            title="기간제 회원권 추가"
            formData={formData}
            setFormData={setFormData}
            uploadingImage={uploadingImage}
            imageUrls={imageUrls}
            setImageUrls={setImageUrls}
            onClose={() => { setShowAddModal(false); resetForm() }}
            onSubmit={handleAddMembership}
            handleImageUpload={handleImageUpload}
          />
        )}

        {showEditModal && (
          <Modal
            title="기간제 회원권 수정"
            formData={formData}
            setFormData={setFormData}
            uploadingImage={uploadingImage}
            imageUrls={imageUrls}
            setImageUrls={setImageUrls}
            onClose={() => { setShowEditModal(false); resetForm() }}
            onSubmit={handleEditMembership}
            handleImageUpload={handleImageUpload}
          />
        )}
      </main>
    </div>
  )
}

// 모달 컴포넌트 공통화
const Modal = ({ title, formData, setFormData, uploadingImage, imageUrls, setImageUrls, onClose, onSubmit, handleImageUpload }) => {
  const getImageUrl = async (key) => {
    if (!key) return null
    try {
      const { getViewUrl } = await import('../../../lib/api')
      const url = await getViewUrl(key)
      return url
    } catch {
      return `https://protein-friends-s3.s3.ap-northeast-2.amazonaws.com/${key}`
    }
  }

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
    <div className="bg-background-dark/90 rounded-xl shadow-xl w-full max-w-2xl p-8 m-4 border border-border-dark/60">
      <h3 className="text-2xl font-bold mb-6">{title}</h3>
      <form onSubmit={onSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
  <label className="block text-sm font-medium text-gray-400 mb-2">회원권 이미지</label>

  {/* 이미지 클릭 업로드 박스 */}
  <div
    onClick={() => document.getElementById('membershipPicUpload').click()}
    className="relative w-32 h-32 border border-border-dark/60 rounded-lg bg-background-dark/60 
               flex items-center justify-center cursor-pointer hover:border-primary/70 transition-colors"
  >
     {formData.membershipPicUrl && imageUrls[formData.membershipPicUrl] ? (
      <img
        src={imageUrls[formData.membershipPicUrl]}
        alt="회원권 이미지"
        className="w-full h-full object-cover rounded-lg"
      />
    ) : formData.membershipPicUrl ? (
      <div className="w-full h-full rounded-lg bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400">📷</span>
      </div>
    ) : (
      <div className="text-gray-500 text-sm flex flex-col items-center gap-1">
        <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
        <span>이미지 추가</span>
      </div>
    )}
    {uploadingImage && (
      <div className="absolute inset-0 bg-blue-500/70 flex items-center justify-center rounded-lg">
        <span className="text-white text-sm">업로드 중...</span>
      </div>
    )}
  </div>

  {/* 숨겨진 파일 입력 */}
  <input
    id="membershipPicUpload"
    type="file"
    accept="image/*"
    className="hidden"
    onChange={async (e) => {
      const file = e.target.files[0]
      if (file) {
        const key = await handleImageUpload(file)
        if (key) {
          setFormData({ ...formData, membershipPicUrl: key })
          // 잠시 후 이미지 URL 업데이트 (S3에 이미지가 완전히 저장될 시간 주기)
          setTimeout(async () => {
            const imageUrl = await getImageUrl(key)
            setImageUrls(prev => ({ ...prev, [key]: imageUrl }))
          }, 1000)
        }
      }
    }}
    disabled={uploadingImage}
  />
</div>

            <Input label="회원권 이름" value={formData.membershipName} onChange={v => setFormData({ ...formData, membershipName: v })} />
            <Input label="기간 (일)" type="number" value={formData.membershipDurationDays} onChange={v => setFormData({ ...formData, membershipDurationDays: v })} />
          </div>
          <div className="space-y-4">
            <Input label="회원권 가격 (원)" type="number" value={formData.membershipPrice} onChange={v => setFormData({ ...formData, membershipPrice: v })} />
            <Input label="할인 금액 (원)" type="number" value={formData.membershipSalePrice} onChange={v => setFormData({ ...formData, membershipSalePrice: v })} />
            <input
              type="text"
              disabled
              value={`₩${(parseFloat(formData.membershipPrice || 0) - parseFloat(formData.membershipSalePrice || 0)).toLocaleString()}`}
              className="w-full rounded-lg border border-border-dark/60 bg-gray-700/50 px-4 py-2.5 text-gray-400 cursor-not-allowed"
            />
            <select
              value={formData.isActive.toString()}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
              className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5"
            >
              <option value="true">판매중</option>
              <option value="false">판매중지</option>
            </select>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-lg">취소</button>
          <button type="submit" disabled={uploadingImage} className="px-6 py-2.5 bg-primary text-white rounded-lg">
            {uploadingImage ? '처리 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  </div>
  )
}

const Input = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-2.5"
    />
  </div>
)

export default MembershipManagement
