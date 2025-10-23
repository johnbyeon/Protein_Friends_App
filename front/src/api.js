import axios from 'axios'

// 생산환경(Nginx)에서는 /api가 백엔드로 프록시됩니다.
// 로컬 개발은 vite proxy(8080) 사용.
export const api = axios.create({ baseURL: '/api' });

// 업로드용 프리사인 URL 발급
export async function presignUpload({ filename, contentType, contentLength }) {
  const { data } = await api.post('/uploads/presign', { filename, contentType, contentLength })
  // data: { key, putUrl }
  return data
}

// 보기용 프리사인 URL 발급
export async function getViewUrl(key) {
  const { data } = await api.get('/uploads/view-url', { params: { key } })
  // data: { url }
  return data.url
}