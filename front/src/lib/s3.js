import { post, get } from './api'

/**
 * S3 Presigned Upload URL 발급 (인증 필수, DB 자동 저장)
 * @param {Object} params - { filename, contentType, contentLength, description, imageType }
 * @returns {Promise<{ key: string, putUrl: string, imageId: number }>}
 */
export async function presignUpload({ filename, contentType, contentLength, description = '', imageType = 'MEAL' }) {
  const res = await post('/api/s3/upload', {
    filename,
    contentType,
    contentLength,
    description,
    imageType
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'Presign upload 실패')
  }

  return res.json()
}

/**
 * S3에 파일 직접 업로드 (진행률 포함)
 * @param {string} putUrl - Presigned PUT URL
 * @param {File} file - 업로드할 파일
 * @param {string} contentType - MIME 타입
 * @param {Function} onProgress - 진행률 콜백 (0~100)
 */
export function putWithProgress(putUrl, file, contentType, onProgress) {
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

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error('Upload failed'))
      }
    }

    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(file)
  })
}

/**
 * S3에서 파일 조회 URL 발급 (인증 필수, 본인 이미지만)
 * @param {string} key - S3 객체 키
 * @returns {Promise<string>} - Presigned GET URL
 */
export async function getViewUrl(key) {
  const res = await get(`/api/s3/download?key=${encodeURIComponent(key)}`)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'View URL 발급 실패')
  }

  return res.text()
}

/**
 * 내 이미지 목록 조회 (인증 필수)
 * @returns {Promise<Array>} - 이미지 목록
 */
export async function getMyImages() {
  const res = await get('/api/s3/my-images')

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || '이미지 목록 조회 실패')
  }

  return res.json()
}
