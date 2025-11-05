// ⬇️ persist 안의 state/actions에 “어댑터” 하나만 추가
loginWithJwt: (jwt) => {
  const payload = parseJwt(jwt) || {}
  const nowSec = Math.floor(Date.now() / 1000)
  const expSec = typeof payload.exp === 'number' ? payload.exp : (nowSec + 3600)
  const ttlSec = Math.max(0, expSec - nowSec)

  const role =
    payload.role || payload.roles || payload.auth || 'USER'

  const user = {
    email: payload.email ?? null,
    role: Array.isArray(role) ? role.join(',') : String(role),
    name: payload.name ?? payload.nickname ?? payload.given_name ?? null
  }

  // 기존 로직 그대로 재사용
  get().loginFromResponse({
    access_token: jwt,
    refresh_token: null,
    expires_in: ttlSec,
    user
  })
}