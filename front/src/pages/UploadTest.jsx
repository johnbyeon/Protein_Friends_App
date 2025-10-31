import { useState } from 'react'
import { presignUpload, getViewUrl } from '../lib/api'

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

export default function UploadTest() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [uploadedKey, setUploadedKey] = useState('')
  const [viewUrl, setViewUrl] = useState('')
  const [description, setDescription] = useState('')
  const [imageType, setImageType] = useState('MEAL') // 기본값: 식단
  const [savedData, setSavedData] = useState(null)

  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    setFile(f || null)
    setProgress(0)
    setStatus('')
    setUploadedKey('')
    setViewUrl('')
    setSavedData(null)
    if (f) setPreview(URL.createObjectURL(f))
  }

  const onUpload = async () => {
    try {
      if (!file) return setStatus('먼저 파일을 선택하세요.')
      // 간단 검증
      const allow = ['image/png', 'image/jpeg', 'image/webp']
      if (!allow.includes(file.type)) return setStatus('PNG/JPEG/WEBP만 업로드 가능해요.')
      if (file.size > 10 * 1024 * 1024) return setStatus('최대 10MB까지 허용합니다.')

      setStatus('프리사인 URL 발급 중 (인증 + DB 저장)...')
      const { key, putUrl, imageId } = await presignUpload({
        filename: file.name,
        contentType: file.type,
        contentLength: file.size,
        description: description.trim(),
        imageType: imageType, // 이미지 타입 전송
      })

      setStatus('S3에 업로드 중...')
      await putWithProgress(putUrl, file, file.type, setProgress)

      setUploadedKey(key)
      setStatus('업로드 완료! 보기 URL 발급 중...')
      const url = await getViewUrl(key)
      setViewUrl(url)

      // DB 저장 완료 정보 표시
      setSavedData({
        id: imageId,
        filename: file.name,
        size: file.size,
        description: description.trim(),
        createdAt: new Date().toISOString()
      })

      setStatus('완료 ✅ (S3 업로드 + DB 저장 성공)')
    } catch (err) {
      console.error('업로드 에러:', err)
      console.error('에러 상세:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      })
      setStatus(`실패: ${err.message}`)
    }
  }

  return (
    <section className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">S3 업로드 + DB 저장 테스트</h1>
      <p className="text-gray-600 mt-1">이미지 선택 → S3 업로드 → URL 발급 → DB 저장</p>

      <div className="mt-6 space-y-4">
        {/* 파일 선택 */}
        <div>
          <label className="block text-sm font-medium mb-1">이미지 파일</label>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-600
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-black file:text-white
              hover:file:opacity-90"
          />
        </div>

        {/* 이미지 타입 선택 */}
        <div>
          <label className="block text-sm font-medium mb-1">이미지 타입 ⏰</label>
          <select
            value={imageType}
            onChange={(e) => setImageType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="PROFILE">프로필 이미지 (7일 유효)</option>
            <option value="MEAL">식단 사진 (24시간 유효)</option>
            <option value="EXERCISE">운동 기록 (12시간 유효)</option>
            <option value="INBODY">인바디/민감 데이터 (30분 유효)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            타입별로 URL 만료 시간이 다릅니다
          </p>
        </div>

        {/* 설명 입력 */}
        <div>
          <label className="block text-sm font-medium mb-1">설명 (선택)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이미지에 대한 설명을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* 미리보기 */}
        {preview && (
          <div className="border rounded p-3 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-2">미리보기</p>
            <img src={preview} alt="preview" className="max-h-48 rounded border bg-white" />
          </div>
        )}

        {/* 업로드 버튼 */}
        <button
          onClick={onUpload}
          className="w-full px-4 py-3 rounded bg-black text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!file}
        >
          {file ? 'S3 업로드 + DB 저장' : '파일을 선택하세요'}
        </button>

        {/* 진행률 */}
        {progress > 0 && progress < 100 && (
          <div className="border rounded p-3 bg-blue-50">
            <p className="text-sm font-medium text-blue-900 mb-2">업로드 진행률: {progress}%</p>
            <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* 상태 메시지 */}
        {status && (
          <div className={`border rounded p-3 ${
            status.includes('실패') ? 'bg-red-50 border-red-200' :
            status.includes('완료') ? 'bg-green-50 border-green-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-sm font-medium ${
              status.includes('실패') ? 'text-red-800' :
              status.includes('완료') ? 'text-green-800' :
              'text-blue-800'
            }`}>
              {status}
            </p>
          </div>
        )}

        {/* S3 키 정보 */}
        {uploadedKey && (
          <div className="border rounded p-3 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-1">S3 저장 키</p>
            <code className="text-xs bg-gray-200 px-2 py-1 rounded block break-all">{uploadedKey}</code>
          </div>
        )}

        {/* DB 저장 결과 */}
        {savedData && (
          <div className="border rounded p-4 bg-green-50 border-green-200">
            <p className="text-sm font-bold text-green-900 mb-2">✅ DB 저장 완료</p>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="font-medium">ID:</span> {savedData.id}</p>
              <p><span className="font-medium">파일명:</span> {savedData.filename}</p>
              <p><span className="font-medium">크기:</span> {(savedData.size / 1024).toFixed(2)} KB</p>
              {savedData.description && <p><span className="font-medium">설명:</span> {savedData.description}</p>}
              <p><span className="font-medium">생성일:</span> {new Date(savedData.createdAt).toLocaleString('ko-KR')}</p>
            </div>
          </div>
        )}

        {/* 업로드된 이미지 */}
        {viewUrl && (
          <div className="border rounded p-4 bg-white">
            <p className="text-sm font-medium text-gray-700 mb-2">업로드된 이미지</p>
            <img src={viewUrl} alt="uploaded" className="max-h-64 rounded border mx-auto" />
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">프리사인 GET URL:</p>
              <a
                className="text-xs text-blue-600 underline break-all hover:text-blue-800"
                href={viewUrl}
                target="_blank"
                rel="noreferrer"
              >
                {viewUrl}
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
