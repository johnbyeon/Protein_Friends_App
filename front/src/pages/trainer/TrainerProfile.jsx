import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, put, presignUpload, getViewUrl } from '../../lib/api'

// S3 업로드 헬퍼
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

export default function TrainerProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [fetchLoading, setFetchLoading] = useState(true)

  // Form fields (수정 가능한 필드만)
  const [trainerData, setTrainerData] = useState(null)
  const [tAwardTitle, setTAwardTitle] = useState('')
  const [tAboutMe, setTAboutMe] = useState('')
  const [tImageUrl, setTImageUrl] = useState('')

  // 이미지 업로드
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  // 트레이너 본인 정보 불러오기
  useEffect(() => {
    const loadTrainerProfile = async () => {
      setFetchLoading(true)
      try {
        const res = await get('/api/trainer/profile')
        if (res.ok) {
          const data = await res.json()
          console.log('✅ 트레이너 정보 로드:', data)
          setTrainerData(data)
          setTAwardTitle(data.tawardTitle || '')
          setTAboutMe(data.taboutMe || '')
          setTImageUrl(data.timageUrl || '')
          setImagePreview(data.timageUrl || '')
        } else {
          setMessage('❌ 트레이너 정보를 불러오는데 실패했습니다.')
        }
      } catch (err) {
        console.error('트레이너 정보 로드 에러:', err)
        setMessage('❌ 트레이너 정보 로드 중 오류 발생')
      } finally {
        setFetchLoading(false)
      }
    }

    loadTrainerProfile()
  }, [])

  // 이미지 파일 선택
  // 이미지 선택 및 자동 업로드
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setMessage('❌ PNG/JPEG/WEBP만 업로드 가능합니다')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage('❌ 최대 10MB까지 허용됩니다')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setMessage('')
    setUploadProgress(0)

    // 자동으로 S3 업로드 시작
    try {
      setMessage('이미지 업로드 중...')

      const { key, putUrl } = await presignUpload({
        filename: file.name,
        contentType: file.type,
        contentLength: file.size,
        description: '트레이너 프로필 사진',
        imageType: 'PROFILE',
      })

      await putWithProgress(putUrl, file, file.type, setUploadProgress)

      const viewUrl = await getViewUrl(key)
      setTImageUrl(viewUrl)
      setMessage('✅ 이미지 업로드 완료')
    } catch (err) {
      console.error('이미지 업로드 실패:', err)
      setMessage('❌ 이미지 업로드 실패: ' + err.message)
    }
  }

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const payload = {
        tAwardTitle: tAwardTitle || null,
        tAboutMe: tAboutMe || null,
        tImageUrl: tImageUrl || null,
      }

      const res = await put('/api/trainer/profile', payload)

      if (res.ok) {
        setMessage('✅ 프로필이 수정되었습니다.')
        setTimeout(() => {
          navigate('/trainer/dashboard')
        }, 1500)
      } else {
        const errorText = await res.text()
        setMessage(`❌ 수정 실패: ${errorText}`)
      }
    } catch (err) {
      console.error('프로필 수정 에러:', err)
      setMessage('❌ 프로필 수정 중 오류 발생')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-gray-400 text-lg">프로필 정보를 불러오는 중...</div>
      </div>
    )
  }

  if (!trainerData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-center space-y-4">
          <div className="text-error text-lg">트레이너 정보를 찾을 수 없습니다.</div>
          <button
            onClick={() => navigate('/trainer/dashboard')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen py-12 bg-background-dark">
      <div className="w-full max-w-3xl mx-auto bg-surface-dark rounded-xl shadow-lg p-8 space-y-6 border border-primary/20">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">내 프로필 수정</h1>
          <div className="h-1 w-20 bg-primary rounded"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 (읽기 전용) */}
          <div className="bg-background-dark rounded-lg p-6 border border-border-light">
            <h2 className="text-xl font-semibold text-text-light mb-4">기본 정보 (수정 불가)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <div>
                <span className="text-gray-500">이름:</span> <span className="font-medium">{trainerData.tname}</span>
              </div>
              <div>
                <span className="text-gray-500">생년월일:</span> <span className="font-medium">{trainerData.tbirthDay}</span>
              </div>
              <div>
                <span className="text-gray-500">전화번호:</span> <span className="font-medium">{trainerData.tphoneNumber}</span>
              </div>
              <div>
                <span className="text-gray-500">소속 지점:</span> <span className="font-medium">{trainerData.gymName || '정보 없음'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">재직 상태:</span>{' '}
                <span className={`font-medium ${trainerData.isEmployed ? 'text-primary' : 'text-error'}`}>
                  {trainerData.isEmployed ? '재직 중' : '퇴사'}
                </span>
              </div>
            </div>
          </div>

          {/* 프로필 사진 업로드 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-light">프로필 사진</h2>
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* 사진 미리보기 (클릭하여 업로드) */}
              <label htmlFor="profileImageInput" className="cursor-pointer group">
                <div className="w-48 h-48 flex-shrink-0 bg-gray-700 rounded-lg flex items-center justify-center border border-primary/20 relative overflow-hidden">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="프로필" className="w-full h-full object-cover" />
                      {/* 호버 오버레이 */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-white">photo_camera</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <span className="material-symbols-outlined text-5xl text-gray-400 mb-2 block">photo_camera</span>
                      <p className="text-xs text-gray-400">클릭하여 업로드</p>
                    </div>
                  )}
                </div>
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>

              {/* 업로드 상태 */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="flex-grow space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">업로드 중: {uploadProgress}%</p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 수상 이력 */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-text-light">
              수상 이력
            </label>
            <textarea
              value={tAwardTitle}
              onChange={(e) => setTAwardTitle(e.target.value)}
              placeholder="수상 이력을 입력하세요"
              rows={4}
              className="w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
            />
          </div>

          {/* 자기소개 */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-text-light">
              자기소개
            </label>
            <textarea
              value={tAboutMe}
              onChange={(e) => setTAboutMe(e.target.value)}
              placeholder="자기소개를 입력하세요"
              rows={6}
              className="w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
            />
            <p className="text-xs text-gray-500">
              회원들이 트레이너님을 선택할 때 참고하는 중요한 정보입니다.
            </p>
          </div>

          {/* 메시지 */}
          {message && (
            <div className={`text-center py-3 px-4 rounded-lg ${
              message.includes('✅') ? 'bg-primary/20 text-primary' : 'bg-error/20 text-error'
            }`}>
              {message}
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/trainer/dashboard')}
              disabled={loading}
              className="rounded-lg py-3 px-8 font-semibold text-white bg-gray-600 hover:bg-gray-500 disabled:opacity-50 transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg py-3 px-8 font-semibold text-white bg-primary hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  처리 중...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  저장하기
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

