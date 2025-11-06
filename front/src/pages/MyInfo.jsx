import { useState, useEffect } from 'react'
import { get, put, presignUpload, getViewUrl } from '../lib/api'
import { useBranchStore } from '../stores/branchStore'
import { useAuthStore } from '../stores/authStore'
import { openSocialPopup } from '../utils/openSocialPopup'
import AddressSearchModal from '../components/AddressSearchModal'

import userprofile from '../assets/user_profile.svg'

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

export default function MyInfo() {
  const { branches, fetchBranches } = useBranchStore()
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [userInfo, setUserInfo] = useState(null)

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profilePicture: '',
    gender: '',
    address: '',
    birthDay: '',
    gId: null,
    height: '',
    weight: ''
  })

  // 이미지 업로드
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  // 주소 검색 모달
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  
  // 비밀번호 변경 모달
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // 소셜 로그인 여부 확인 (password가 SOCIAL_로 시작하면 소셜 로그인)
  const isSocialLogin = userInfo && userInfo.password && userInfo.password.startsWith('SOCIAL_')

  // 사용자 정보 불러오기
  useEffect(() => {
    const loadUserInfo = async () => {
      setLoading(true)
      try {
        const res = await get('/api/users/me/detail')
        if (res.ok) {
          const data = await res.json()
          console.log('✅ 사용자 정보 로드:', data)
          setUserInfo(data)
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            profilePicture: data.profilePicture || '',
            gender: data.gender || '선택 안함',
            address: data.address || '',
            birthDay: data.birthDay || '',
            gId: data.gId || null,
            height: data.height || '',
            weight: data.weight || ''
          })
          setImagePreview(data.profilePicture || '')
        } else {
          setMessage('❌ 사용자 정보를 불러오는데 실패했습니다.')
        }
      } catch (err) {
        console.error('사용자 정보 로드 에러:', err)
        setMessage('❌ 사용자 정보 로드 중 오류 발생')
      } finally {
        setLoading(false)
      }
    }

    loadUserInfo()
  }, [])

  // 지점 목록 불러오기
  useEffect(() => {
    if (branches.length === 0) {
      fetchBranches()
    }
  }, [branches.length, fetchBranches])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 이미지 파일 선택 및 자동 업로드
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('PNG, JPEG, WEBP 파일만 업로드 가능합니다.')
      return
    }

    // 파일 크기 검증
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 최대 10MB까지 허용됩니다.')
      return
    }

    // 미리보기 표시
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))

    // 자동 업로드 시작
    try {
      setMessage('이미지 업로드 중...')

      const { key, putUrl } = await presignUpload({
        filename: file.name,
        contentType: file.type,
        contentLength: file.size,
        description: '사용자 프로필 사진',
        imageType: 'PROFILE',
      })

      await putWithProgress(putUrl, file, file.type, setUploadProgress)

      const viewUrl = await getViewUrl(key)
      setFormData(prev => ({ ...prev, profilePicture: viewUrl }))
      setImagePreview(viewUrl)
      setImageFile(null)
      setUploadProgress(0)
      setMessage('✅ 이미지 업로드 완료')
      
      // authStore의 user 정보도 업데이트 (네비게이션 바에 즉시 반영)
      if (user) {
        setUser({ ...user, profilePicture: viewUrl })
      }
    } catch (err) {
      console.error('이미지 업로드 실패:', err)
      setMessage('❌ 이미지 업로드 실패: ' + err.message)
      setUploadProgress(0)
      // 업로드 실패 시 미리보기 원상복구
      setImagePreview(formData.profilePicture || '')
      setImageFile(null)
    }
  }

  // 이미지 S3 업로드
  const handleImageUpload = async () => {
    if (!imageFile) {
      alert('업로드할 이미지를 선택하세요')
      return
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(imageFile.type)) {
      alert('PNG, JPEG, WEBP 파일만 업로드 가능합니다.')
      return
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      alert('파일 크기는 최대 10MB까지 허용됩니다.')
      return
    }

    try {
      setMessage('이미지 업로드 중...')

      const { key, putUrl } = await presignUpload({
        filename: imageFile.name,
        contentType: imageFile.type,
        contentLength: imageFile.size,
        description: '사용자 프로필 사진',
        imageType: 'PROFILE',
      })

      await putWithProgress(putUrl, imageFile, imageFile.type, setUploadProgress)

      const viewUrl = await getViewUrl(key)
      setFormData(prev => ({ ...prev, profilePicture: viewUrl }))
      setImagePreview(viewUrl)  // 업로드된 이미지를 미리보기에 표시
      setImageFile(null)  // 파일 선택 초기화
      setUploadProgress(0)  // 진행률 초기화
      setMessage('✅ 이미지 업로드 완료')
    } catch (err) {
      console.error('이미지 업로드 실패:', err)
      setMessage('❌ 이미지 업로드 실패: ' + err.message)
      setUploadProgress(0)
    }
  }

  // 저장
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('이름과 전화번호는 필수입니다.')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        profilePicture: formData.profilePicture || null,
        gender: formData.gender || null,
        address: formData.address || null,
        birthDay: formData.birthDay || null,
        gId: formData.gId || null,
        height: formData.height || null,
        weight: formData.weight || null
      }

      const res = await put('/api/users/me/info', payload)

      if (res.ok) {
        const updated = res.data
        setUserInfo(updated)
        setMessage('✅ 정보가 저장되었습니다.')
        alert('정보가 저장되었습니다.')
        
        // authStore의 user 정보도 업데이트
        if (user) {
          setUser({ 
            ...user, 
            name: updated.name,
            phone: updated.phone,
            profilePicture: updated.profilePicture 
          })
        }
      } else {
        const errorText = res.data || '저장에 실패했습니다.'
        setMessage(`❌ 저장 실패: ${errorText}`)
      }
    } catch (err) {
      console.error('정보 저장 에러:', err)
      setMessage('❌ 정보 저장 중 오류 발생')
    } finally {
      setSaving(false)
    }
  }

  // 비밀번호 변경
  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (passwordData.newPassword.length < 8) {
      alert('새 비밀번호는 최소 8자 이상이어야 합니다.')
      return
    }

    try {
      const { put } = await import('../lib/api')
      const res = await put('/api/users/me/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (res.ok) {
        alert('✅ 비밀번호가 변경되었습니다.')
        setIsPasswordModalOpen(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const errorText = await res.text()
        alert(`❌ 비밀번호 변경 실패: ${errorText}`)
      }
    } catch (err) {
      console.error('비밀번호 변경 에러:', err)
      alert('비밀번호 변경 중 오류가 발생했습니다.')
    }
  }

  // 소셜 계정 연결 (단일 계정)
  const handleSocialConnect = async () => {
    const { post } = await import('../lib/api')

    if (!confirm('소셜 계정을 연결하시겠습니까?\n\n소셜 로그인 시 자동 로그인이 가능해집니다.')) {
      return
    }

    try {
      setMessage('소셜 계정 연결 중...')
      
      const linkRequest = {
        provider: 'google',
        providerUserId: `${userInfo.email}_social_${Date.now()}`,
        accessToken: `social_token_${Date.now()}`,
        refreshToken: null,
        tokenExpiresIn: null
      }

      const res = await post('/api/users/me/social/link', linkRequest)

      if (res.ok) {
        const text = await res.text()
        setMessage(`✅ ${text}`)
        
        // 사용자 정보 다시 로드
        const detailRes = await get('/api/users/me/detail')
        if (detailRes.ok) {
          const data = await detailRes.json()
          setUserInfo(data)
        }
        
        alert('✅ 소셜 계정이 연결되었습니다.')
      } else {
        const errorText = await res.text()
        setMessage(`❌ ${errorText}`)
        alert(`연결 실패: ${errorText}`)
      }
    } catch (err) {
      console.error('소셜 계정 연결 실패:', err)
      setMessage('❌ 소셜 계정 연결 중 오류 발생')
      alert('소셜 계정 연결 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-400 text-lg">정보를 불러오는 중...</div>
      </div>
    )
  }

  if (!userInfo) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-error text-lg">사용자 정보를 찾을 수 없습니다.</div>
      </div>
    )
  }

  const hasSocialAccount = userInfo.googleLinked || userInfo.naverLinked || userInfo.kakaoLinked

  return (
    <div className="flex justify-center py-8">
        <div className="w-full max-w-4xl px-4 md:px-8">
        <h1 className="text-3xl font-bold text-primary mb-4">내 정보 보기</h1>
        
        {/* 메시지 (상단 표시) */}
        {message && (
          <div className={`mb-6 text-center py-3 px-4 rounded-lg ${
            message.includes('✅') ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-error/20 text-error border border-error/40'
          }`}>
            {message}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer">
              <div 
                className="w-32 h-32 rounded-full bg-cover bg-center border-2 border-primary/30"
                style={{
                  backgroundImage: imagePreview 
                    ? `url("${imagePreview}")` 
                    : `url("${userprofile}")`,
                  backgroundColor: 'transparent'
                }}
              ></div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
              />
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              >
                <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
              </div>
            </div>
            
            {/* 업로드 진행 중 표시 */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="text-xs text-primary">
                업로드 중... {uploadProgress}%
              </div>
            )}
          </div>

          {/* 기본 정보 */}
          <div className="w-full md:w-auto flex-1 text-center md:text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label 
                  className="block text-sm font-medium text-gray-400 mb-2" 
                  htmlFor="name"
                >
                  이름 *
                </label>
                <input
                  className="form-input relative block w-full appearance-none rounded-lg border border-primary/20 bg-surface-dark px-3 py-4 text-text-light placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm transition-all duration-200"
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium text-gray-400 mb-2" 
                  htmlFor="phone"
                >
                  전화번호 *
                </label>
                <input
                  className="form-input relative block w-full appearance-none rounded-lg border border-primary/20 bg-surface-dark px-3 py-4 text-text-light placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm transition-all duration-200"
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            {/* 소셜 계정 연결 & 비밀번호 변경 */}
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-400 mb-3">소셜 계정 연결</p>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {!isSocialLogin ? (
                      /* 정상 가입 사용자: 미연결 배지 */
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/30 rounded-lg border border-gray-600/40">
                        <span className="material-symbols-outlined text-gray-500 text-lg">cancel</span>
                        <span className="text-sm text-gray-500 font-medium">소셜 계정 미연결</span>
                      </div>
                    ) : (
                      /* 소셜 가입 사용자: 연결된 계정 표시 */
                      <>
                        {userInfo.googleLinked && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-blue)]/20 rounded-lg border border-[var(--color-blue)]/40">
                            <span className="material-symbols-outlined text-text_light text-lg">check_circle</span>
                            <span className="text-sm text-text_light font-medium">Google 연결됨</span>
                          </div>
                        )}
                        {userInfo.naverLinked && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-green)]/20 rounded-lg border border-[var(--color-green)]/40">
                            <span className="material-symbols-outlined text-text_light text-lg">check_circle</span>
                            <span className="text-sm text-text_light font-medium">Naver 연결됨</span>
                          </div>
                        )}
                        {userInfo.kakaoLinked && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-yellow)]/20 rounded-lg border border-[var(--color-yellow)]/40">
                            <span className="material-symbols-outlined text-text_light text-lg">check_circle</span>
                            <span className="text-sm text-text_light font-medium">Kakao 연결됨</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    가입한 이메일과 같은 소셜계정을 로그인하면 자동으로 연동됩니다.
                  </p>
                </div>

                {/* 비밀번호 변경 버튼 (직접 가입 사용자만) */}
                {!isSocialLogin && (
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-primary border border-border-dark rounded-lg hover:border-primary/40 transition-all ml-4"
                    type="button"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    <span className="material-symbols-outlined text-sm">lock</span>
                    비밀번호 변경
                  </button>
                )}
              </div>
            </div>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">업로드 중: {uploadProgress}%</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 추가 정보 탭 */}
        <div>
          <div className="border-b border-primary/30">
            <nav aria-label="Tabs" className="-mb-px flex space-x-8">
              <span className="border-primary text-primary whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                추가 정보
              </span>
            </nav>
          </div>
          
          <div className="pt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label 
                  className="block text-sm font-medium text-gray-400 mb-2" 
                  htmlFor="gender"
                >
                  성별
                </label>
                <select
                  className="form-input relative block w-full appearance-none rounded-lg border border-primary/20 bg-surface-dark px-3 py-4 text-text-light focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm transition-all duration-200"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option>선택 안함</option>
                  <option>남성</option>
                  <option>여성</option>
                </select>
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium text-gray-400 mb-2" 
                  htmlFor="birthDay"
                >
                  생년월일
                </label>
                <input
                  className="form-input relative block w-full appearance-none rounded-lg border border-primary/20 bg-surface-dark px-3 py-4 text-text-light placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm transition-all duration-200"
                  id="birthDay"
                  name="birthDay"
                  type="date"
                  value={formData.birthDay}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium text-gray-400 mb-2" 
                  htmlFor="gId"
                >
                  소속 지점
                </label>
                <select
                  className="form-input relative block w-full appearance-none rounded-lg border border-primary/20 bg-surface-dark px-3 py-4 text-text-light focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm transition-all duration-200"
                  id="gId"
                  name="gId"
                  value={formData.gId || ''}
                  onChange={handleInputChange}
                >
                  <option value="">선택 안함</option>
                  {branches.map(branch => (
                    <option key={branch.gId} value={branch.gId}>
                      {branch.gName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium text-gray-400 mb-2" 
                  htmlFor="address"
                >
                  주소
                </label>
                <div className="relative">
                  <input
                    className="form-input relative block w-full appearance-none rounded-lg border border-primary/20 bg-surface-dark px-3 py-4 pr-12 text-text-light placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm transition-all duration-200 cursor-pointer"
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onClick={() => setIsAddressModalOpen(true)}
                    placeholder="클릭하여 주소 검색"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <span className="material-symbols-outlined">search</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium text-gray-400 mb-2" 
                  htmlFor="height"
                >
                  키 (cm)
                </label>
                <input
                  className="form-input relative block w-full appearance-none rounded-lg border border-primary/20 bg-surface-dark px-3 py-4 text-text-light placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm transition-all duration-200"
                  id="height"
                  name="height"
                  type="number"
                  min="0"
                  max="300"
                  step="0.1"
                  placeholder="예: 175"
                  value={formData.height}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium text-gray-400 mb-2" 
                  htmlFor="weight"
                >
                  몸무게 (kg)
                </label>
                <input
                  className="form-input relative block w-full appearance-none rounded-lg border border-primary/20 bg-surface-dark px-3 py-4 text-text-light placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm transition-all duration-200"
                  id="weight"
                  name="weight"
                  type="number"
                  min="0"
                  max="500"
                  step="0.1"
                  placeholder="예: 70"
                  value={formData.weight}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg bg-primary text-black font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 주소 검색 모달 */}
      <AddressSearchModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelect={(address) => {
          setFormData(prev => ({ ...prev, address }))
          setIsAddressModalOpen(false)
        }}
      />

      {/* 비밀번호 변경 모달 */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-dark border border-border-dark rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary">비밀번호 변경</h2>
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                className="text-gray-400 hover:text-text-light transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="form-input relative block w-full appearance-none rounded-lg border border-primary/20 bg-background-dark px-3 py-3 text-text-light placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm transition-all duration-200"
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="form-input relative block w-full appearance-none rounded-lg border border-primary/20 bg-background-dark px-3 py-3 text-text-light placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm transition-all duration-200"
                  placeholder="새 비밀번호 (최소 8자)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="form-input relative block w-full appearance-none rounded-lg border border-primary/20 bg-background-dark px-3 py-3 text-text-light placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm transition-all duration-200"
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-400 border border-border-dark rounded-lg hover:bg-surface-dark/50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handlePasswordChange}
                className="flex-1 px-4 py-3 text-sm font-medium bg-primary text-black rounded-lg hover:opacity-90 transition-opacity"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
