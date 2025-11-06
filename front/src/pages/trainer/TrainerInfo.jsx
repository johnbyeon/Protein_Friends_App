import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, post, put, del, presignUpload } from '../../lib/api'
import adminUserImg from '../../assets/admin_user.svg'

// S3 업로드용 progress tracking
function putWithProgress(putUrl, file, contentType, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', putUrl, true)
    xhr.setRequestHeader('Content-Type', contentType)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && typeof onProgress === 'function') {
        const pct = Math.round((e.loaded / e.total) * 100)
        onProgress(pct)
      }
    }
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Upload failed')))
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(file)
  })
}

export default function TrainerInfo() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [trainers, setTrainers] = useState([])
  const [error, setError] = useState('')
  const [gyms, setGyms] = useState([]) // 지점 목록

  // 페이지네이션 상태
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const size = 10

  // 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTrainer, setSelectedTrainer] = useState(null)

  // 이미지 업로드 상태
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  // 폼 데이터
  const [formData, setFormData] = useState({
    gId: '',
    uId: '',
    tName: '',
    tBirthDay: '',
    tPhoneNumber: '',
    tAwardTitle: '',
    tAboutMe: '',
    isEmployed: true,
    tImageUrl: ''
  })

  // 트레이너 목록 불러오기
  const loadTrainers = async (pageNum = 0) => {
    setLoading(true)
    try {
      const res = await get(`/api/admin/trainers?page=${pageNum}&size=${size}`)
      if (res.ok) {
        const data = await res.json()
        console.log('✅ 트레이너 목록 로드:', data)
        setTrainers(data.content || [])
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
        setPage(pageNum)
      } else {
        setError('❌ 트레이너 정보를 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('트레이너 목록 로드 에러:', err)
      setError('❌ 트레이너 정보 로드 중 오류 발생')
    } finally {
      setLoading(false)
    }
  }

  // 지점 목록 불러오기
  const loadGyms = async () => {
    try {
      const res = await get('/api/gyms')
      if (res.ok) {
        const data = await res.json()
        console.log('✅ 지점 목록 로드:', data)
        setGyms(data || [])
      } else {
        console.error('❌ 지점 목록 로드 실패')
      }
    } catch (err) {
      console.error('지점 목록 로드 에러:', err)
    }
  }

  useEffect(() => {
    loadTrainers(0)
    loadGyms()
  }, [])

  // 이미지 파일 선택
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('PNG, JPEG, WEBP 파일만 업로드 가능합니다.')
      return
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하만 가능합니다.')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setUploadProgress(0)
  }

  // S3에 이미지 업로드
  const uploadImageToS3 = async () => {
    if (!imageFile) return null

    try {
      setUploading(true)

      // 1. Presigned URL 발급 (DB에도 저장됨)
      const { key, putUrl } = await presignUpload({
        filename: imageFile.name,
        contentType: imageFile.type,
        contentLength: imageFile.size,
        description: '트레이너 프로필 이미지',
        imageType: 'PROFILE'
      })

      // 2. S3에 직접 업로드
      await putWithProgress(putUrl, imageFile, imageFile.type, setUploadProgress)

      // 3. S3 Key 반환
      return key
    } catch (err) {
      console.error('이미지 업로드 실패:', err)
      alert('이미지 업로드에 실패했습니다: ' + err.message)
      return null
    } finally {
      setUploading(false)
    }
  }

  // 트레이너 등록
  const handleCreate = async (e) => {
    e.preventDefault()

    try {
      // 이미지 업로드
      let imageKey = formData.tImageUrl
      if (imageFile) {
        imageKey = await uploadImageToS3()
        if (!imageKey) return // 업로드 실패 시 중단
      }

      const submitData = {
        ...formData,
        tImageUrl: imageKey
      }

      const res = await post('/api/admin/trainers', submitData)
      if (res.ok) {
        alert('✅ 트레이너가 등록되었습니다.')
        setShowCreateModal(false)
        resetForm()
        loadTrainers(page)
      } else {
        const errorText = await res.text()
        alert('❌ 등록 실패: ' + errorText)
      }
    } catch (err) {
      console.error('트레이너 등록 에러:', err)
      alert('❌ 트레이너 등록 중 오류 발생')
    }
  }

  // 트레이너 수정
  const handleUpdate = async (e) => {
    e.preventDefault()

    try {
      // 이미지 업로드 (새 이미지가 있을 때만)
      let imageKey = formData.tImageUrl
      if (imageFile) {
        imageKey = await uploadImageToS3()
        if (!imageKey) return // 업로드 실패 시 중단
      }

      const submitData = {
        ...formData,
        tImageUrl: imageKey
      }

      const res = await put(`/api/admin/trainers/${selectedTrainer.tId}`, submitData)
      if (res.ok) {
        alert('✅ 트레이너 정보가 수정되었습니다.')
        setShowEditModal(false)
        resetForm()
        loadTrainers(page)
      } else {
        const errorText = await res.text()
        alert('❌ 수정 실패: ' + errorText)
      }
    } catch (err) {
      console.error('트레이너 수정 에러:', err)
      alert('❌ 트레이너 수정 중 오류 발생')
    }
  }

  // 트레이너 삭제
  const handleDelete = async () => {
    try {
      const res = await del(`/api/admin/trainers/${selectedTrainer.tId}`)
      if (res.ok || res.status === 204) {
        alert('✅ 트레이너가 삭제되었습니다.')
        setShowDeleteModal(false)
        setSelectedTrainer(null)
        loadTrainers(page)
      } else {
        const errorText = await res.text()
        alert('❌ 삭제 실패: ' + errorText)
      }
    } catch (err) {
      console.error('트레이너 삭제 에러:', err)
      alert('❌ 트레이너 삭제 중 오류 발생')
    }
  }

  // 수정 모달 열기
  const openEditModal = (trainer) => {
    setSelectedTrainer(trainer)
    setFormData({
      gId: trainer.gId || '',
      tName: trainer.tName || '',
      tBirthDay: trainer.tBirthDay || '',
      tPhoneNumber: trainer.tPhoneNumber || '',
      tAwardTitle: trainer.tAwardTitle || '',
      tAboutMe: trainer.tAboutMe || '',
      isEmployed: trainer.isEmployed ?? true,
      tImageUrl: trainer.tImageUrl || ''
    })
    // 기존 이미지 미리보기
    setImagePreview(trainer.tImageUrl || '')
    setImageFile(null)
    setUploadProgress(0)
    setShowEditModal(true)
  }

  // 삭제 모달 열기
  const openDeleteModal = (trainer) => {
    setSelectedTrainer(trainer)
    setShowDeleteModal(true)
  }

  // 등록 모달 열기
  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  // 폼 리셋
  const resetForm = () => {
    setFormData({
      gId: '',
      uId: '',
      tName: '',
      tBirthDay: '',
      tPhoneNumber: '',
      tAwardTitle: '',
      tAboutMe: '',
      isEmployed: true,
      tImageUrl: ''
    })
    setSelectedTrainer(null)
    setImageFile(null)
    setImagePreview('')
    setUploadProgress(0)
  }

  // 페이지 변경
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadTrainers(newPage)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-gray-400 text-lg">트레이너 정보를 불러오는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-center space-y-4">
          <div className="text-error text-lg">{error}</div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark p-10">
      <div className="max-w-full">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-4xl font-bold tracking-tight text-white">트레이너 정보</h2>
          <button
            onClick={openCreateModal}
            className="rounded-md bg-primary py-2.5 px-6 text-base font-bold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark"
          >
            트레이너 등록
          </button>
        </div>

        {/* 트레이너 테이블 */}
        {trainers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">등록된 트레이너가 없습니다.</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-border-dark custom-scrollbar">
              <table className="min-w-full divide-y divide-border-dark">
                <thead className="bg-surface-dark">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">트레이너 번호</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">지점</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">트레이너 정보</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">생년월일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">연락처</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">재직 상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark bg-surface-dark">
                  {trainers.map((trainer) => (
                    <tr key={trainer.tId}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">{trainer.tId}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">{trainer.gymName || '정보 없음'}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          {trainer.tImageUrl ? (
                            <img
                              alt={`${trainer.tName} 트레이너`}
                              className="h-12 w-12 rounded-full object-cover"
                              src={trainer.tImageUrl}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center">
                              <span className="material-symbols-outlined text-gray-400">person</span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{trainer.tName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">{trainer.tBirthDay}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">{trainer.tPhoneNumber}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${trainer.isEmployed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {trainer.isEmployed ? '재직중' : '퇴직'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => openEditModal(trainer)}
                          className="mr-4 cursor-pointer text-gray-400 hover:text-white"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(trainer)}
                          className="cursor-pointer text-gray-400 hover:text-white"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="mt-6 flex justify-center items-center space-x-4">
              <div className="text-gray-400 text-sm">
                총 {totalElements}명 (페이지 {page + 1} / {totalPages})
              </div>
              <nav aria-label="Pagination" className="inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="relative inline-flex items-center rounded-l-md border border-border-dark bg-surface-dark px-2 py-2 text-sm font-medium text-gray-400 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>

                {/* 페이지 번호들 */}
                {Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => {
                  // 현재 페이지 근처만 표시 (현재 ±2)
                  if (pageNum < page - 2 || pageNum > page + 2) {
                    if (pageNum === 0 || pageNum === totalPages - 1) {
                      // 첫 페이지와 마지막 페이지는 항상 표시
                    } else {
                      return null
                    }
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                        pageNum === page
                          ? 'z-10 border-primary bg-primary/20 text-primary'
                          : 'border-border-dark bg-surface-dark text-gray-400 hover:bg-primary/10'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  )
                })}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages - 1}
                  className="relative inline-flex items-center rounded-r-md border border-border-dark bg-surface-dark px-2 py-2 text-sm font-medium text-gray-400 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* 트레이너 등록 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-surface-dark rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar border border-primary/20">
            <h3 className="text-2xl font-bold text-white mb-6">트레이너 등록</h3>
            <form onSubmit={handleCreate} className="space-y-5">
              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">프로필 이미지</label>
                <div className="flex items-center space-x-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      className="h-24 w-24 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <img
                      src={adminUserImg}
                      alt="기본 프로필"
                      className="h-24 w-24 rounded-full object-cover border-2 border-primary/20 bg-gray-700 p-2"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                    />
                    {uploading && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                          <span>업로드 중...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">지점 *</label>
                <select
                  required
                  value={formData.gId}
                  onChange={(e) => setFormData({ ...formData, gId: e.target.value })}
                  className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all duration-200"
                >
                  <option value="">지점 선택</option>
                  {gyms.map((gym) => (
                    <option key={gym.gId} value={gym.gId}>
                      {gym.gName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">유저 ID *</label>
                <input
                  type="number"
                  required
                  value={formData.uId}
                  onChange={(e) => setFormData({ ...formData, uId: e.target.value })}
                  className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all duration-200"
                  placeholder="유저 ID 입력"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">이름 *</label>
                <input
                  type="text"
                  required
                  value={formData.tName}
                  onChange={(e) => setFormData({ ...formData, tName: e.target.value })}
                  className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all duration-200"
                  placeholder="트레이너 이름"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">생년월일 *</label>
                <input
                  type="date"
                  required
                  value={formData.tBirthDay}
                  onChange={(e) => setFormData({ ...formData, tBirthDay: e.target.value })}
                  className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">연락처 *</label>
                <input
                  type="tel"
                  required
                  value={formData.tPhoneNumber}
                  onChange={(e) => setFormData({ ...formData, tPhoneNumber: e.target.value })}
                  className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all duration-200"
                  placeholder="010-0000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">수상 이력</label>
                <textarea
                  value={formData.tAwardTitle}
                  onChange={(e) => setFormData({ ...formData, tAwardTitle: e.target.value })}
                  className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all duration-200"
                  placeholder="수상 이력 입력"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">자기소개</label>
                <textarea
                  value={formData.tAboutMe}
                  onChange={(e) => setFormData({ ...formData, tAboutMe: e.target.value })}
                  className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all duration-200"
                  placeholder="자기소개 입력"
                  rows="3"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isEmployed}
                  onChange={(e) => setFormData({ ...formData, isEmployed: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label className="ml-2 text-sm text-gray-400">재직중</label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 rounded-lg py-3 font-semibold text-white bg-primary hover:opacity-90 active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? '업로드 중...' : '등록'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  className="flex-1 rounded-lg py-3 font-semibold border border-primary/20 text-gray-400 hover:bg-primary/10 transition-all duration-200"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 트레이너 수정 모달 */}
      {showEditModal && selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-surface-dark rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar border border-primary/20">
            <h3 className="text-2xl font-bold text-white mb-6">트레이너 정보 수정</h3>
            <form onSubmit={handleUpdate} className="space-y-5">
              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">프로필 이미지</label>
                <div className="flex items-center space-x-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      className="h-24 w-24 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <img
                      src={adminUserImg}
                      alt="기본 프로필"
                      className="h-24 w-24 rounded-full object-cover border-2 border-primary/20 bg-gray-700 p-2"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                    />
                    <p className="text-xs text-gray-500 mt-1">새 이미지를 선택하면 기존 이미지가 교체됩니다</p>
                    {uploading && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                          <span>업로드 중...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">지점</label>
                <select
                  value={formData.gId}
                  onChange={(e) => setFormData({ ...formData, gId: e.target.value })}
                  className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all duration-200"
                >
                  <option value="">지점 선택</option>
                  {gyms.map((gym) => (
                    <option key={gym.gId} value={gym.gId}>
                      {gym.gName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">이름</label>
                <input
                  type="text"
                  value={formData.tName}
                  onChange={(e) => setFormData({ ...formData, tName: e.target.value })}
                  className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">생년월일</label>
                <input
                  type="date"
                  value={formData.tBirthDay}
                  onChange={(e) => setFormData({ ...formData, tBirthDay: e.target.value })}
                  className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">연락처</label>
                <input
                  type="tel"
                  value={formData.tPhoneNumber}
                  onChange={(e) => setFormData({ ...formData, tPhoneNumber: e.target.value })}
                  className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">수상 이력</label>
                <textarea
                  value={formData.tAwardTitle}
                  onChange={(e) => setFormData({ ...formData, tAwardTitle: e.target.value })}
                  className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all duration-200"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">자기소개</label>
                <textarea
                  value={formData.tAboutMe}
                  onChange={(e) => setFormData({ ...formData, tAboutMe: e.target.value })}
                  className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all duration-200"
                  rows="3"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isEmployed}
                  onChange={(e) => setFormData({ ...formData, isEmployed: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label className="ml-2 text-sm text-gray-400">재직중</label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 rounded-lg py-3 font-semibold text-white bg-primary hover:opacity-90 active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? '업로드 중...' : '수정'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    resetForm()
                  }}
                  className="flex-1 rounded-lg py-3 font-semibold border border-primary/20 text-gray-400 hover:bg-primary/10 transition-all duration-200"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-surface-dark rounded-xl p-8 max-w-md w-full border border-primary/20">
            <h3 className="text-2xl font-bold text-white mb-4">트레이너 삭제</h3>
            <p className="text-gray-400 mb-6">
              <strong className="text-white">{selectedTrainer.tName}</strong> 트레이너를 정말 삭제하시겠습니까?
              <br />
              <span className="text-sm text-red-400 mt-2 block">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDelete}
                className="flex-1 rounded-lg py-3 font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.97] transition-all duration-150"
              >
                삭제
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedTrainer(null)
                }}
                className="flex-1 rounded-lg py-3 font-semibold border border-primary/20 text-gray-400 hover:bg-primary/10 transition-all duration-200"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
