import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBoardTypeStore } from '../../stores/boardTypeStore'
import { useAuthStore } from '../../stores/authStore'
import { presignUpload, getViewUrl } from '../../lib/api'

// S3 업로드 헬퍼 함수
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

/**
 * 게시글 작성/수정 폼
 * - 모든 Board 엔티티 필드 지원
 * - 팝업 설정, 이미지 업로드, 링크 등
 */
export default function BoardForm() {
  const { typeAddressName, pId } = useParams()
  const navigate = useNavigate()
  const { boardTypes, fetchBoardTypes } = useBoardTypeStore()
  const { user } = useAuthStore()

  const isEditMode = !!pId
  const [loading, setLoading] = useState(false)
  const [currentType, setCurrentType] = useState(null)

  // 사용자 role에 따른 기본 경로 설정
  const getBasePath = () => {
    if (user?.role === 'ROLE_ADMIN') return '/admin'
    if (user?.role === 'ROLE_TRAINER') return '/trainer'
    return '/admin' // 기본값
  }

  // 이미지 업로드 상태
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('')

  // 폼 상태
  const [formData, setFormData] = useState({
    pTitle: '',
    pContent: '',
    pImageUrl: '',
    pLink: '',
    pIsPopup: false,
    isAlwaysPopup: false,
    pPopupStartDate: '',
    pPopupEndDate: '',
    isUnlimited: false,
    pSetVisible: true
  })

  // 게시글 타입 로드
  useEffect(() => {
    const loadBoardTypes = async () => {
      if (boardTypes.length === 0) {
        await fetchBoardTypes()
      }
    }
    loadBoardTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardTypes.length])

  // 현재 타입 설정
  useEffect(() => {
    if (boardTypes.length > 0 && typeAddressName) {
      const type = boardTypes.find(t => t.ptypeaddressName === typeAddressName)
      setCurrentType(type)
    }
  }, [boardTypes, typeAddressName])

  // 수정 모드일 경우 기존 데이터 로드
  useEffect(() => {
    const loadBoard = async () => {
      if (!isEditMode || !pId) return

      try {
        const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
        const token = localStorage.getItem('jwt')

        const response = await fetch(`${SERVER_ORIGIN}/api/boards/${pId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.status === 401) {
          navigate('/login')
          return
        }

        if (!response.ok) {
          throw new Error('게시글을 불러오는데 실패했습니다.')
        }

        const data = await response.json()
        console.log('📝 수정 모드 - 불러온 데이터:', data)
        
        setFormData({
          pTitle: data.pTitle || '',
          pContent: data.pContent || '',
          pImageUrl: data.pImageUrl || '',
          pLink: data.pLink || '',
          pIsPopup: data.pIsPopup || false,
          isAlwaysPopup: data.isAlwaysPopup || false,
          pPopupStartDate: data.pPopupStartDate || '',
          pPopupEndDate: data.pPopupEndDate || '',
          isUnlimited: data.isUnlimited || false,
          pSetVisible: data.pSetVisible !== undefined ? data.pSetVisible : true
        })

        // 기존 이미지가 있으면 미리보기 설정
        if (data.pImageUrl) {
          setImagePreview(data.pImageUrl)
        }
      } catch (err) {
        console.error('게시글 로드 에러:', err)
        alert(err.message)
        navigate(-1)
      }
    }

    loadBoard()
  }, [isEditMode, pId, navigate])

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // 이미지 파일 선택 핸들러 (자동 업로드)
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('PNG, JPEG, WEBP 형식의 이미지만 업로드 가능합니다.')
      return
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 크기는 10MB 이하여야 합니다.')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setUploadStatus('')
    setUploadProgress(0)

    // 자동으로 S3 업로드 시작
    try {
      setUploadStatus('이미지 업로드 중...')
      setLoading(true)

      // 1. Presigned URL 발급
      const { key, putUrl } = await presignUpload({
        filename: file.name,
        contentType: file.type,
        contentLength: file.size,
        description: `게시판 이미지: ${formData.pTitle || '제목 없음'}`,
        imageType: 'BOARD'
      })

      // 2. S3에 직접 업로드
      setUploadStatus('S3에 업로드 중...')
      await putWithProgress(putUrl, file, file.type, setUploadProgress)

      // 3. S3 Key 저장 (백엔드가 자동으로 Presigned URL로 변환)
      setFormData(prev => ({ ...prev, pImageUrl: key }))

      // 4. 미리보기용 Presigned URL 생성
      const viewUrl = await getViewUrl(key)
      setImagePreview(viewUrl)

      setUploadStatus('이미지 업로드 완료 ✓')
    } catch (err) {
      console.error('이미지 업로드 에러:', err)
      setUploadStatus('이미지 업로드 실패')
      alert(`이미지 업로드 실패: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 이미지 제거
  const handleImageRemove = () => {
    setImageFile(null)
    setImagePreview('')
    setFormData(prev => ({ ...prev, pImageUrl: '' }))
    setUploadStatus('')
    setUploadProgress(0)
  }

  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log('📤 [게시글 제출 시작]')
    console.log('  - currentType:', currentType)
    console.log('  - typeAddressName:', typeAddressName)
    console.log('  - formData.pTitle:', formData.pTitle)
    console.log('  - formData.pContent:', formData.pContent)

    if (!formData.pTitle.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    if (!formData.pContent.trim()) {
      alert('내용을 입력해주세요.')
      return
    }

    if (!currentType) {
      alert('게시판 타입을 찾을 수 없습니다.')
      return
    }

    console.log('  - currentType.ptypeid:', currentType.ptypeid)

    setLoading(true)

    try {
      const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
      // authStore에서 토큰 가져오기
      const token = useAuthStore.getState().token || localStorage.getItem('jwt')
      
      if (!token) {
        alert('로그인이 필요합니다.')
        navigate('/login')
        return
      }
      
      console.log('🔑 토큰 확인:', token ? '토큰 있음' : '토큰 없음')
      console.log('👤 사용자 정보:', user)

      const requestBody = {
        pTypeId: currentType.ptypeid,
        pTitle: formData.pTitle.trim(),
        pContent: formData.pContent.trim(),
        pImageUrl: formData.pImageUrl.trim() || null,
        pLink: formData.pLink.trim() || null,
        pIsPopup: formData.pIsPopup,
        isAlwaysPopup: formData.isAlwaysPopup,
        pPopupStartDate: formData.pPopupStartDate || null,
        pPopupEndDate: formData.pPopupEndDate || null,
        isUnlimited: formData.isUnlimited,
        pSetVisible: formData.pSetVisible
      }

      // 역할에 따라 API 경로 결정 (모두 /api/admin/boards 사용)
      const url = isEditMode
        ? `${SERVER_ORIGIN}/api/admin/boards/${pId}`
        : `${SERVER_ORIGIN}/api/admin/boards`

      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      if (response.status === 401) {
        navigate('/login')
        return
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || '게시글 저장에 실패했습니다.')
      }

      // 응답 데이터에서 게시글 ID 추출
      const savedBoard = await response.json()
      console.log('✅ 저장된 게시글:', savedBoard)
      
      alert(isEditMode ? '게시글이 수정되었습니다.' : '게시글이 작성되었습니다.')
      
      // role에 따라 동적 경로 이동
      const basePath = getBasePath()
      
      // 생성/수정된 게시글의 상세 페이지로 이동
      if (savedBoard && savedBoard.pId) {
        navigate(`${basePath}/boards/${typeAddressName}/${savedBoard.pId}`)
      } else {
        // ID가 없으면 목록으로 이동
        navigate(`${basePath}/boards/${typeAddressName}`)
      }
    } catch (err) {
      console.error('게시글 저장 에러:', err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 취소 핸들러
  const handleCancel = () => {
    if (confirm('작성을 취소하시겠습니까?')) {
      navigate(-1)
    }
  }

  if (!currentType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-gray-400">게시판 타입을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-light mb-2">
            {isEditMode ? '게시글 수정' : '게시글 작성'} - {currentType.ptypename}
          </h1>
          <div className="h-1 w-20 bg-primary rounded"></div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 카드 */}
          <div className="bg-surface-dark border border-border-light rounded-xl p-6">
            <h2 className="text-xl font-semibold text-text-light mb-4">기본 정보</h2>

            {/* 제목 */}
            <div className="mb-4">
              <label htmlFor="pTitle" className="block text-sm font-medium text-gray-400 mb-2">
                제목 <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="pTitle"
                name="pTitle"
                value={formData.pTitle}
                onChange={handleChange}
                className="w-full bg-background-dark border border-border-light rounded-lg px-4 py-2
                  text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="게시글 제목을 입력하세요"
                disabled={loading}
                required
              />
            </div>

            {/* 내용 */}
            <div className="mb-4">
              <label htmlFor="pContent" className="block text-sm font-medium text-gray-400 mb-2">
                내용 <span className="text-error">*</span>
              </label>
              <textarea
                id="pContent"
                name="pContent"
                value={formData.pContent}
                onChange={handleChange}
                rows={10}
                className="w-full bg-background-dark border border-border-light rounded-lg px-4 py-2
                  text-text-light focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                placeholder="게시글 내용을 입력하세요"
                disabled={loading}
                required
              />
            </div>

            {/* 이미지 업로드 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                이미지 업로드
              </label>

              {/* 이미지 미리보기 또는 기존 이미지 (클릭하여 변경) */}
              <div className="relative group mb-4">
                <label htmlFor="imageInput" className="cursor-pointer block">
                  {(imagePreview || formData.pImageUrl) ? (
                    <div className="relative">
                      <img
                        src={imagePreview || formData.pImageUrl}
                        alt="미리보기"
                        className="w-full max-h-96 object-contain rounded-lg border border-border-light"
                      />
                      {/* 호버 오버레이 */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="text-center text-white">
                          <span className="material-symbols-outlined text-5xl mb-2">photo_camera</span>
                          <p className="text-sm">클릭하여 이미지 변경</p>
                        </div>
                      </div>
                      {/* 삭제 버튼 */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          handleImageRemove()
                        }}
                        className="absolute top-2 right-2 bg-error text-white rounded-full p-2
                          hover:bg-red-600 transition-colors z-10"
                        disabled={loading}
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border-light rounded-lg p-12 text-center hover:border-primary transition-colors">
                      <span className="material-symbols-outlined text-6xl text-gray-500 mb-4 block">add_photo_alternate</span>
                      <p className="text-gray-400 mb-2">이미지를 클릭하여 업로드</p>
                      <p className="text-xs text-gray-500">PNG, JPEG, WEBP (최대 10MB)</p>
                    </div>
                  )}
                </label>
                <input
                  id="imageInput"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </div>

              {/* 업로드 진행 상태 */}
              {uploadStatus && (
                <div className="mt-2">
                  <p className="text-sm text-gray-400">{uploadStatus}</p>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-1 w-full bg-border-light rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 링크 URL */}
            <div>
              <label htmlFor="pLink" className="block text-sm font-medium text-gray-400 mb-2">
                링크 URL
              </label>
              <input
                type="url"
                id="pLink"
                name="pLink"
                value={formData.pLink}
                onChange={handleChange}
                className="w-full bg-background-dark border border-border-light rounded-lg px-4 py-2
                  text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">관련 링크가 있다면 입력하세요</p>
            </div>
          </div>

          {/* 팝업 설정 카드 */}
          <div className="bg-surface-dark border border-border-light rounded-xl p-6">
            <h2 className="text-xl font-semibold text-text-light mb-4">팝업 설정</h2>

            {/* 팝업 여부 */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="pIsPopup"
                  checked={formData.pIsPopup}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary bg-background-dark border-border-light rounded
                    focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
                <span className="text-text-light">팝업으로 표시</span>
              </label>
            </div>

            {/* 팝업 활성화 시 추가 옵션 */}
            {formData.pIsPopup && (
              <>
                {/* 상시 팝업 */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAlwaysPopup"
                      checked={formData.isAlwaysPopup}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary bg-background-dark border-border-light rounded
                        focus:ring-2 focus:ring-primary"
                      disabled={loading}
                    />
                    <span className="text-text-light">상시 팝업 (항상 표시)</span>
                  </label>
                </div>

                {/* 기간 제한 없음 */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isUnlimited"
                      checked={formData.isUnlimited}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary bg-background-dark border-border-light rounded
                        focus:ring-2 focus:ring-primary"
                      disabled={loading}
                    />
                    <span className="text-text-light">기간 제한 없음</span>
                  </label>
                </div>

                {/* 팝업 기간 설정 (기간 제한 있을 때만) */}
                {!formData.isUnlimited && (
                  <div className="grid grid-cols-2 gap-4">
                    {/* 시작일 */}
                    <div>
                      <label htmlFor="pPopupStartDate" className="block text-sm font-medium text-gray-400 mb-2">
                        팝업 시작일
                      </label>
                      <input
                        type="date"
                        id="pPopupStartDate"
                        name="pPopupStartDate"
                        value={formData.pPopupStartDate}
                        onChange={handleChange}
                        className="w-full bg-background-dark border border-border-light rounded-lg px-4 py-2
                          text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={loading}
                      />
                    </div>

                    {/* 종료일 */}
                    <div>
                      <label htmlFor="pPopupEndDate" className="block text-sm font-medium text-gray-400 mb-2">
                        팝업 종료일
                      </label>
                      <input
                        type="date"
                        id="pPopupEndDate"
                        name="pPopupEndDate"
                        value={formData.pPopupEndDate}
                        onChange={handleChange}
                        className="w-full bg-background-dark border border-border-light rounded-lg px-4 py-2
                          text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 노출 설정 카드 */}
          <div className="bg-surface-dark border border-border-light rounded-xl p-6">
            <h2 className="text-xl font-semibold text-text-light mb-4">노출 설정</h2>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="pSetVisible"
                  checked={formData.pSetVisible}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary bg-background-dark border-border-light rounded
                    focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
                <span className="text-text-light">게시글 노출</span>
              </label>
              <p className="mt-2 text-xs text-gray-500 ml-7">
                체크 해제 시 게시글이 목록에 표시되지 않습니다
              </p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 bg-surface-light text-text-light rounded-lg font-semibold
                hover:bg-border-light transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold
                hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  처리 중...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  {isEditMode ? '수정하기' : '작성하기'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
