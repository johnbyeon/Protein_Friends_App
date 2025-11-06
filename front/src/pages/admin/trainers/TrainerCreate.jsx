import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, post, presignUpload, getViewUrl } from '../../../lib/api'
import { useBranchStore } from '../../../stores/branchStore'

// S3 업로드 헬퍼 (UploadTest에서 가져옴)
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

export default function TrainerCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Zustand store에서 지점 목록 가져오기
  const { branches, fetchBranches } = useBranchStore()

  // Form fields
  const [gId, setGId] = useState('')
  const [uId, setUId] = useState('')
  const [tName, setTName] = useState('')
  const [tBirthDay, setTBirthDay] = useState('')
  const [tPhoneNumber, setTPhoneNumber] = useState('')
  const [tAwardTitle, setTAwardTitle] = useState('')
  const [isEmployed, setIsEmployed] = useState(true)
  const [tImageUrl, setTImageUrl] = useState('')

  // 유저 검색
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // 이미지 업로드
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  // 지점 목록 불러오기 (zustand store 사용)
  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  // 유저 검색
  const handleSearchUser = async () => {
    if (!userSearchQuery.trim()) {
      setMessage('검색어를 입력하세요')
      return
    }

    try {
      const res = await get(`/api/users/search?q=${encodeURIComponent(userSearchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data)
        setShowSearchResults(true)
      } else {
        setMessage('유저 검색 실패')
      }
    } catch (err) {
      console.error('유저 검색 에러:', err)
      setMessage('유저 검색 중 오류 발생')
    }
  }

  // 유저 선택
  const handleSelectUser = (user) => {
    console.log('🔍 선택된 유저:', user)
    const userId = user.uId || user.uid
    console.log('🆔 추출된 userId:', userId)

    setSelectedUser(user)
    setUId(userId)
    setTName(user.name || '')
    setTBirthDay(user.birthDay || user.birthday || '')
    setTPhoneNumber(user.phone || '')
    setShowSearchResults(false)
    setUserSearchQuery(`${user.name} (${user.email})`)
  }

  // 이미지 파일 선택 및 자동 업로드
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setMessage('❌ PNG/JPEG/WEBP만 업로드 가능합니다')
      return
    }

    // 파일 크기 검증
    if (file.size > 10 * 1024 * 1024) {
      setMessage('❌ 최대 10MB까지 허용됩니다')
      return
    }

    // 미리보기 표시
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))

    // 자동 업로드 시작
    try {
      setMessage('프리사인 URL 발급 중...')

      // 1. Presigned URL 요청
      const { key, putUrl, imageId } = await presignUpload({
        filename: file.name,
        contentType: file.type,
        contentLength: file.size,
        description: '트레이너 프로필 사진',
        imageType: 'PROFILE',
      })

      setMessage('S3에 업로드 중...')

      // 2. S3 직접 업로드
      await putWithProgress(putUrl, file, file.type, setUploadProgress)

      setMessage('업로드 완료! 보기 URL 발급 중...')

      // 3. View URL 발급
      const viewUrl = await getViewUrl(key)
      setTImageUrl(viewUrl)
      setImagePreview(viewUrl)
      setImageFile(null)
      setUploadProgress(0)
      setMessage('✅ 이미지 업로드 완료 (DB 저장 ID: ' + imageId + ')')

      console.log('✅ 업로드 성공:', { key, imageId, viewUrl })
    } catch (err) {
      console.error('❌ 이미지 업로드 실패:', err)
      setMessage('❌ 이미지 업로드 실패: ' + err.message)
      setUploadProgress(0)
      // 업로드 실패 시 미리보기 원상복구
      setImagePreview('')
      setImageFile(null)
    }
  }

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // 필수 필드 검증 (디버깅 포함)
    console.log('📝 필수 필드 확인:', { gId, uId, tName, tBirthDay, tPhoneNumber, tImageUrl })

    const missingFields = []
    if (!gId) missingFields.push('지점')
    if (!uId) missingFields.push('유저')
    if (!tName) missingFields.push('이름')
    if (!tBirthDay) missingFields.push('생년월일')
    if (!tPhoneNumber) missingFields.push('전화번호')
    if (!tImageUrl) missingFields.push('사진')

    if (missingFields.length > 0) {
      setMessage(`❌ 다음 항목을 입력하세요: ${missingFields.join(', ')}`)
      setLoading(false)
      return
    }

    try {
      const payload = {
        gId: parseInt(gId),
        uId: parseInt(uId),
        tName,
        tBirthDay,
        tPhoneNumber,
        tAwardTitle: tAwardTitle || null,
        tAboutMe: null, // 자기소개는 트레이너가 직접 수정
        isEmployed,
        tImageUrl,
      }

      const res = await post('/api/admin/trainers', payload)

      if (res.ok) {
        const data = await res.json()
        setMessage('✅ 트레이너 등록 완료')
        setTimeout(() => {
          navigate('/admin/trainers')
        }, 1000)
      } else {
        const errorText = await res.text()
        setMessage(`❌ 등록 실패: ${errorText}`)
      }
    } catch (err) {
      console.error('트레이너 등록 에러:', err)
      setMessage('❌ 등록 중 오류 발생')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen py-12 bg-background-dark">
      <div className="w-full max-w-2xl mx-auto bg-surface-dark rounded-xl shadow-lg p-8 space-y-6 border border-primary/20">
        <h1 className="text-2xl font-bold text-center text-primary">신규 트레이너 등록</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이미지 업로드 + 기본 정보 */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* 왼쪽: 프로필 사진 */}
            <div className="w-full md:w-48 flex-shrink-0">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                소개 사진
              </label>
              <div className="relative group">
                <div className="aspect-square w-full bg-gray-700 rounded-lg flex items-center justify-center border border-primary/20 relative overflow-hidden cursor-pointer">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-5xl text-gray-400">photo_camera</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="material-symbols-outlined text-white text-4xl">photo_camera</span>
                  </div>
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <p className="text-xs text-primary mt-2 text-center">
                    업로드 중: {uploadProgress}%
                  </p>
                )}
              </div>
            </div>

            {/* 오른쪽: 폼 필드 */}
            <div className="flex-grow space-y-6 w-full">
              {/* 유저 검색 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  유저 검색
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchUser())}
                      placeholder="이름 또는 이메일로 검색"
                      className="w-full rounded-lg border border-primary/20 bg-gray-700 px-4 py-2.5 pr-10 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      search
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchUser}
                    className="flex-shrink-0 rounded-lg py-2.5 px-6 font-semibold text-white bg-gray-600 hover:bg-gray-500 whitespace-nowrap"
                  >
                    검색
                  </button>
                </div>

                {/* 검색 결과 */}
                {showSearchResults && Array.isArray(searchResults) && searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-primary/20 rounded-lg bg-gray-800">
                    {searchResults.map((user) => (
                      <div
                        key={user.uId || user.uid}
                        onClick={() => handleSelectUser(user)}
                        className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-200"
                      >
                        {user.name} ({user.email})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 지점 선택 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">
                    지점 <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={gId}
                    onChange={(e) => setGId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-primary/20 bg-gray-700 px-4 py-2.5 text-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  >
                    <option value="">지점을 선택하세요</option>
                    {Array.isArray(branches) && branches.map((branch) => (
                      <option key={branch.gid} value={branch.gid}>
                        {branch.gName || branch.gname}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 트레이너 이름 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">
                    트레이너 이름 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={tName}
                    onChange={(e) => setTName(e.target.value)}
                    placeholder="닉네임 입력"
                    required
                    className="w-full rounded-lg border border-primary/20 bg-gray-700 px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>

                {/* 생년월일 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">
                    생년월일 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={tBirthDay}
                    onChange={(e) => setTBirthDay(e.target.value)}
                    required
                    className="w-full rounded-lg border border-primary/20 bg-gray-700 px-4 py-2.5 text-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>

                {/* 전화번호 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">
                    전화번호 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={tPhoneNumber}
                    onChange={(e) => setTPhoneNumber(e.target.value)}
                    placeholder="010-1234-5678"
                    required
                    className="w-full rounded-lg border border-primary/20 bg-gray-700 px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 수상 이력 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">
              수상 이력
            </label>
            <textarea
              value={tAwardTitle}
              onChange={(e) => setTAwardTitle(e.target.value)}
              placeholder="수상 이력을 입력하세요"
              rows={4}
              className="w-full rounded-lg border border-primary/20 bg-gray-700 px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
            />
            <p className="text-xs text-gray-500">
              💡 자기소개는 트레이너 본인이 직접 수정할 수 있습니다.
            </p>
          </div>

          {/* 재직 중 체크박스 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isEmployed"
              checked={isEmployed}
              onChange={(e) => setIsEmployed(e.target.checked)}
              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
            />
            <label htmlFor="isEmployed" className="ml-2 block text-sm text-gray-200">
              재직 중
            </label>
          </div>

          {/* 메시지 */}
          {message && (
            <p className="text-sm text-center text-gray-300">
              {message}
            </p>
          )}

          {/* 버튼 */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/trainers')}
              className="rounded-lg py-3 px-8 font-semibold text-white bg-gray-600 hover:bg-gray-500 transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg py-3 px-8 font-semibold text-white bg-primary hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? '처리 중...' : '트레이너 추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
