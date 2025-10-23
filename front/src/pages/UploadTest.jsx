import { useState } from 'react'
import { presignUpload, getViewUrl } from '../api.js'

function putWithProgress(putUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', putUrl, true)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
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

  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    setFile(f || null)
    setProgress(0)
    setStatus('')
    setUploadedKey('')
    setViewUrl('')
    if (f) setPreview(URL.createObjectURL(f))
  }

  const onUpload = async () => {
    try {
      if (!file) return setStatus('먼저 파일을 선택하세요.')
      // 간단 검증
      const allow = ['image/png', 'image/jpeg', 'image/webp']
      if (!allow.includes(file.type)) return setStatus('PNG/JPEG/WEBP만 업로드 가능해요.')
      if (file.size > 5 * 1024 * 1024) return setStatus('최대 5MB까지 허용합니다.')

      setStatus('프리사인 URL 발급 중...')
      const { key, putUrl } = await presignUpload({
        filename: file.name,
        contentType: file.type,
        contentLength: file.size,
      })

      setStatus('업로드 중...')
      await putWithProgress(putUrl, file, setProgress)

      setUploadedKey(key)
      setStatus('업로드 완료! 보기 URL 발급 중...')
      const url = await getViewUrl(key)
      setViewUrl(url)
      setStatus('완료 ✅')
    } catch (err) {
      console.error(err)
      setStatus(`실패: ${err.message}`)
    }
  }

  return (
    <section className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">S3 Presigned 업로드 테스트</h1>
      <p className="text-gray-600 mt-1">이미지 선택 → 프리사인 PUT 업로드 → 프리사인 GET으로 표시</p>

      <div className="mt-4 space-y-3">
        <input type="file" accept="image/*" onChange={onFileChange} />
        {preview && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">미리보기</p>
            <img src={preview} alt="preview" className="mt-1 max-h-48 rounded border" />
          </div>
        )}

        <button
          onClick={onUpload}
          className="px-4 py-2 rounded bg-black text-white hover:opacity-90 disabled:opacity-50"
          disabled={!file}
        >
          업로드
        </button>

        {progress > 0 && progress < 100 && (
          <div className="mt-1 text-sm">
            업로드 진행률: <b>{progress}%</b>
            <div className="w-full h-2 bg-gray-200 rounded mt-1">
              <div className="h-2 bg-black rounded" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {status && <p className="text-sm mt-1">{status}</p>}

        {uploadedKey && (
          <p className="text-sm mt-1">
            저장 키: <code className="bg-gray-100 px-1 py-0.5 rounded">{uploadedKey}</code>
          </p>
        )}

        {viewUrl && (
          <div className="mt-3">
            <p className="text-sm text-gray-500">프리사인 GET URL</p>
            <a className="text-blue-600 underline break-all" href={viewUrl} target="_blank" rel="noreferrer">
              {viewUrl}
            </a>
            <div className="mt-2">
              <img src={viewUrl} alt="uploaded" className="max-h-56 rounded border" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
