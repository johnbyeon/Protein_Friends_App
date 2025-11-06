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

  console.log('🔍 [apiJson] 요청:', input, init)
  const res = await api(input, { ...init, headers })
  console.log('🔍 [apiJson] 응답 상태:', res.status, res.statusText)
  console.log('🔍 [apiJson] 응답 headers:', Object.fromEntries(res.headers.entries()))
  
  let data = null
  try {
    const text = await res.text()
    console.log('🔍 [apiJson] 응답 텍스트 (앞 100자):', text.substring(0, 100))
    console.log('🔍 [apiJson] 응답 텍스트 길이:', text.length)
    
    if (text.trim()) {
      data = JSON.parse(text)
      console.log('🔍 [apiJson] 파싱된 데이터 타입:', typeof data, 'isArray:', Array.isArray(data))
      console.log('🔍 [apiJson] 파싱된 데이터 길이:', data?.length)
    } else {
      console.log('🔍 [apiJson] 응답 텍스트가 비어있음')
    }
  } catch (e) {
    console.error('❌ [apiJson] JSON 파싱 에러:', e)
    // body가 비어있을 수 있음
  }
  return { ok: res.ok, status: res.status, data, raw: res }
}

// ===== 메서드 헬퍼 =====
export const get = (url, init) => {
  console.log('🔍 GET 요청 URL:', url)
  return api(url, { ...(init || {}), method: 'GET' })
}

export const del = (url, init) =>
  api(url, { ...(init || {}), method: 'DELETE' })

export const patch = (url, body, init) => {
  const isForm = body instanceof FormData
  const headers = new Headers(init?.headers || {})
  if (!isForm) headers.set('Content-Type', 'application/json')
  return api(url, {
    ...(init || {}),
    method: 'PATCH',
    body: isForm ? body : JSON.stringify(body),
    headers
  })
}

export const post = (url, body, init) => {
  const isForm = body instanceof FormData
  const headers = new Headers(init?.headers || {})
  if (!isForm) {
    headers.set('Content-Type', 'application/json')
    console.log('🔍 POST 요청 URL:', url)
    console.log('🔍 POST 요청 바디:', body)
  }
  return api(url, {
    ...(init || {}),
    method: 'POST',
    body: isForm ? body : JSON.stringify(body),
    headers
  })
}

export const put = async (url, body, init) => {
  const isForm = body instanceof FormData
  const headers = new Headers(init?.headers || {})
  if (!isForm) headers.set('Content-Type', 'application/json')
  const res = await api(url, {
    ...(init || {}),
    method: 'PUT',
    body: isForm ? body : JSON.stringify(body),
    headers
  })
  
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `PUT request failed with status ${res.status}`)
  }
  
  let data = null
  try {
    data = await res.json()
  } catch (e) {
    // body가 비어있을 수 있음
  }
  return { ok: res.ok, status: res.status, data, raw: res }
}

// ===== 1:1 문의 관련 API =====

/**
 * 1:1 문의 목록 조회 (인증 필수 - ADMIN/TRAINER)
 * @param {string} status - 'unanswered' | 'answered'
 * @param {number} page - 페이지 번호
 * @param {number} size - 페이지 크기
 * @returns {Promise<Object>} - 페이징된 문의 목록
 */
export async function getInquiries(status = 'unanswered', page = 0, size = 10) {
  const res = await get(`/api/support/inquiries?status=${status}&page=${page}&size=${size}`)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || '문의 목록 조회 실패')
  }

  return res.json()
}

/**
 * 1:1 문의 상세 조회 (인증 필수 - ADMIN/TRAINER/USER)
 * @param {number} id - 문의 ID
 * @returns {Promise<Object>} - 문의 상세 정보
 */
export async function getInquiry(id) {
  const res = await get(`/api/support/inquiries/${id}`)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || '문의 조회 실패')
  }

  return res.json()
}

/**
 * 답변 등록 (인증 필수 - ADMIN/TRAINER)
 * @param {number} id - 문의 ID
 * @param {string} answer - 답변 내용
 * @returns {Promise<Object>} - 업데이트된 문의 정보
 */
export async function createAnswer(id, answer) {
  const res = await post(`/api/support/inquiries/${id}/answer`, { answer })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || '답변 등록 실패')
  }

  return res.json()
}

/**
 * 답변 수정 (인증 필수 - ADMIN/TRAINER)
 * @param {number} id - 문의 ID
 * @param {string} answer - 답변 내용
 * @returns {Promise<Object>} - 업데이트된 문의 정보
 */
export async function updateAnswer(id, answer) {
  const res = await put(`/api/support/inquiries/${id}/answer`, { answer })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || '답변 수정 실패')
  }

  return res.json()
}

/**
 * 미답변 문의 개수 조회 (인증 필수 - ADMIN/TRAINER)
 * @returns {Promise<number>} - 미답변 문의 개수
 */
export async function getUnansweredCount() {
  const res = await get('/api/support/inquiries/count/unanswered')

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || '미답변 문의 개수 조회 실패')
  }

  return res.json()
}

/**
 * 답변완료 문의 개수 조회 (인증 필수 - ADMIN/TRAINER)
 * @returns {Promise<number>} - 답변완료 문의 개수
 */
export async function getAnsweredCount() {
  const res = await get('/api/support/inquiries/count/answered')

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || '답변완료 문의 개수 조회 실패')
  }

  return res.json()
}

/**
 * 내 문의 목록 조회 (인증 필수 - USER)
 * @param {number} page - 페이지 번호
 * @param {number} size - 페이지 크기
 * @returns {Promise<Object>} - 페이징된 내 문의 목록
 */
export async function getMyInquiries(page = 0, size = 10) {
  const res = await get(`/api/support/inquiries/my-inquiries?page=${page}&size=${size}`)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || '내 문의 목록 조회 실패')
  }

  return res.json()
}

/**
 * 문의 등록 (인증 필수 - USER)
 * @param {Object} data - { qtitle, qcontent, qissecret }
 * @returns {Promise<Object>} - 생성된 문의 정보
 */
export async function createInquiry(data) {
  const res = await post('/api/support/inquiries/my-inquiries', data)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || '문의 등록 실패')
  }

  return res.json()
}

// ===== FAQ 관련 API =====

/**
 * FAQ 목록 조회 (공통)
 * @param {string} category - 카테고리 (옵션)
 * @param {string} keyword - 검색어 (옵션)
 * @param {number} page - 페이지 번호
 * @param {number} size - 페이지 크기
 * @returns {Promise<Object>} - 페이징된 FAQ 목록
 */
export async function getFaqs(category = null, keyword = null, page = 0, size = 10) {
  let url = `/api/faqs?page=${page}&size=${size}`
  if (category) url += `&category=${encodeURIComponent(category)}`
  if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
  
  const res = await get(url)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'FAQ 목록 조회 실패')
  }

  return res.json()
}

/**
 * FAQ 상세 조회 (공통)
 * @param {number} id - FAQ ID
 * @returns {Promise<Object>} - FAQ 상세 정보
 */
export async function getFaq(id) {
  const res = await get(`/api/faqs/${id}`)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'FAQ 조회 실패')
  }

  return res.json()
}

/**
 * FAQ 카테고리 목록 조회 (공통)
 * @returns {Promise<Array>} - 카테고리 목록
 */
export async function getFaqCategories() {
  const res = await get('/api/faqs/categories')

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || '카테고리 목록 조회 실패')
  }

  return res.json()
}

/**
 * FAQ 등록 (관리자만)
 * @param {Object} data - { faqtitle, faqquestion, faqanswer, faqcategory }
 * @returns {Promise<Object>} - 생성된 FAQ 정보
 */
export async function createFaq(data) {
  const res = await post('/api/faqs', data)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'FAQ 등록 실패')
  }

  return res.json()
}

/**
 * FAQ 수정 (관리자만)
 * @param {number} id - FAQ ID
 * @param {Object} data - { faqtitle, faqquestion, faqanswer, faqcategory }
 * @returns {Promise<Object>} - 수정된 FAQ 정보
 */
export async function updateFaq(id, data) {
  const res = await put(`/api/faqs/${id}`, data)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'FAQ 수정 실패')
  }

  return res.json()
}

/**
 * FAQ 삭제 (관리자만)
 * @param {number} id - FAQ ID
 * @returns {Promise<string>} - 성공 메시지
 */
export async function deleteFaq(id) {
  const res = await del(`/api/faqs/${id}`)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'FAQ 삭제 실패')
  }

  return res.text()
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
 * 회원권 이미지 조회 URL 발급 (인증 필수, 모든 회원권 이미지 접근 가능)
 * @param {string} key - S3 객체 키
 * @returns {Promise<string>} - Presigned GET URL
 */
export async function getMembershipImageUrl(key) {
  const res = await get(`/api/s3/membership-download?key=${encodeURIComponent(key)}`)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || '회원권 이미지 URL 발급 실패')
  }

  return res.text()
}

// ===== PT 이용권 관리 API =====

/**
 * PT 이용권 목록 조회 (트레이너용)
 * @returns {Promise<Array>} - PT 이용권 목록
 */
export async function getPtTickets() {
  const res = await get('/api/trainer/pt-services')

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'PT 이용권 목록 조회 실패')
  }

  const data = await res.json()
  console.log('🔍 파싱된 데이터:', data)
  return data
}

/**
 * 활성화된 PT 이용권 목록 조회 (POS용)
 * @returns {Promise<Array>} - 활성화된 PT 이용권 목록
 */
export async function getActivePtTickets() {
  const res = await get('/api/trainer/pt-services/active')

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || '활성화된 PT 이용권 목록 조회 실패')
  }

  const data = await res.json()
  return data
}

/**
 * PT 이용권 생성 (트레이너용)
 * @param {Object} data - { ptName, ptCount, ptDurationDays, ptPrice, ptSalePrice, ptPicUrl }
 * @returns {Promise<Object>} - 생성된 PT 이용권 정보
 */
export async function createPtTicket(data) {
  const res = await post('/api/trainer/pt-services', data)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'PT 이용권 생성 실패')
  }

  return res.data
}

/**
 * PT 이용권 수정 (트레이너용)
 * @param {number} id - PT 이용권 ID
 * @param {Object} data - { ptName, ptCount, ptDurationDays, ptPrice, ptSalePrice, ptPicUrl }
 * @returns {Promise<Object>} - 수정된 PT 이용권 정보
 */
export async function updatePtTicket(id, data) {
  const res = await put(`/api/trainer/pt-services/${id}`, data)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'PT 이용권 수정 실패')
  }

  return res.data
}

/**
 * PT 이용권 삭제 (트레이너용)
 * @param {number} id - PT 이용권 ID
 * @returns {Promise<string>} - 성공 메시지
 */
export async function deletePtTicket(id) {
  const res = await del(`/api/trainer/pt-services/${id}`)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'PT 이용권 삭제 실패')
  }

  return res.text()
}

// ===== POS (현장 판매) 관련 API =====

/**
 * PT 이용권 현장 판매
 * @param {Object} data - PT 이용권 판매 데이터
 * @returns {Promise<Object>} - 판매 결과
 */
export async function sellPtPass(data) {
  const res = await post('/api/trainer/pos/pt-pass', data)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'PT 이용권 판매 실패')
  }

  return res.json()
}

/**
 * 회원권 현장 판매
 * @param {Object} data - 회원권 판매 데이터
 * @returns {Promise<Object>} - 판매 결과
 */
export async function sellMembership(data) {
  const res = await post('/api/trainer/pos/membership', data)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || '회원권 판매 실패')
  }

  return res.json()
}