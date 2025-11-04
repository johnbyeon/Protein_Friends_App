// src/lib/api.js
import { useAuthStore } from '../stores/authStore'

/**
 * 공통 fetch 래퍼 (통합판)
 * - Authorization 자동 부착
 * - 401 시 refresh 토큰으로 1회만 재시도 (동시요청 dedupe)
 * - JSON 헬퍼/HTTP 메서드 헬퍼 제공
 */

// 백엔드 베이스 URL (없으면 상대경로 사용: e.g. /api/...)
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || ''

// 동시 401 발생 시 refresh를 한 번만 수행하도록 하는 락
let refreshPromise = null

// 내부: Authorization 헤더 세팅
function buildHeaders(init = {}) {
  const headers = new Headers(init.headers || {})
  if (!init.noAuth) {
    const token = useAuthStore.getState().token
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  return headers
}

// 내부: 실제 fetch 호출
async function doFetch(url, init = {}) {
  const headers = buildHeaders(init)
  return fetch(url, { ...init, headers })
}

// 내부: 토큰 갱신
async function refreshTokens() {
  if (!refreshPromise) {
    const { refreshToken, loginFromResponse, logout, setAuthError } = useAuthStore.getState()
    refreshPromise = (async () => {
      if (!refreshToken) return false
      try {
        const refreshUrl = (API_BASE ? API_BASE : '') + '/api/auth/refresh'
        const r = await fetch(refreshUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        })
        if (!r.ok) {
          logout()
          setAuthError?.('세션이 만료되었습니다. 다시 로그인해주세요.')
          return false
        }
  const data = await r.json()
  await loginFromResponse(data) // token/refreshToken/user/expiresAt 갱신
        return true
      } catch (e) {
        logout()
        setAuthError?.('네트워크 오류로 세션 갱신에 실패했습니다.')
        return false
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

// ===== 메인 래퍼 =====
export async function api(input, init = {}) {
  // 문자열 경로면 API_BASE 선접 ("/"로 시작하는 경우만)
  const url =
    typeof input === 'string' && API_BASE && input.startsWith('/')
      ? API_BASE + input
      : input

  // 1) 최초 요청
  const res = await doFetch(url, init)

  // 2) 401이 아니면 그대로 반환 (성공/기타 에러 포함)
  if (res.status !== 401 || init._retried) return res

  // 3) 401이면 refresh 시도 (동시 dedupe)
  const ok = await refreshTokens()
  if (!ok) return res

  // 4) 새 토큰으로 1회 재시도
  const retryInit = { ...init, _retried: true }
  return doFetch(url, retryInit)
}

// ===== JSON 헬퍼 =====
export async function apiJson(input, init = {}) {
  const headers = new Headers(init.headers || {})
  const isFormData = init.body instanceof FormData
  if (!isFormData) headers.set('Content-Type', 'application/json')

  const res = await api(input, { ...init, headers })
  let data = null
  try {
    data = await res.json()
  } catch (e) {
    // body가 비어있을 수 있음
  }
  return { ok: res.ok, status: res.status, data, raw: res }
}

// ===== 메서드 헬퍼 =====
export const get = (url, init) =>
  api(url, { ...(init || {}), method: 'GET' })

export const del = (url, init) =>
  api(url, { ...(init || {}), method: 'DELETE' })

export const post = (url, body, init) => {
  const isForm = body instanceof FormData
  const headers = new Headers(init?.headers || {})
  if (!isForm) headers.set('Content-Type', 'application/json')
  return api(url, {
    ...(init || {}),
    method: 'POST',
    body: isForm ? body : JSON.stringify(body),
    headers
  })
}

export const put = (url, body, init) => {
  const isForm = body instanceof FormData
  const headers = new Headers(init?.headers || {})
  if (!isForm) headers.set('Content-Type', 'application/json')
  return api(url, {
    ...(init || {}),
    method: 'PUT',
    body: isForm ? body : JSON.stringify(body),
    headers
  })
}

// ===== S3 업로드 관련 API =====

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

/**
 * 이미지 삭제 (인증 필수, 본인 이미지만)
 * @param {number} imageId - 이미지 ID
 * @returns {Promise<string>} - 성공 메시지
 */
export async function deleteImage(imageId) {
  const res = await del(`/api/s3/images/${imageId}`)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || '이미지 삭제 실패')
  }

  return res.text()
}