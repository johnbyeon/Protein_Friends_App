import React from "react";
import { Link } from "react-router-dom";
import pfLogo from '../assets/pflogo.svg'
import { useAuthStore } from '../stores/authStore'
import { useProfileGuard } from '../hooks/useProfileGuard'

const Navbar = () => {


  const { user, token, logout, profileRequired } = useAuthStore()
  const role = user?.role || ''
  const isLoggedIn = !!token && !!user

   console.log('[Navbar] user:', user)
   console.log('[Navbar] role:', role)
  // user가 null이면 아직 정보 로딩 중으로 간주
  const isLoadingUser = isLoggedIn && !user?.role

  const hasAdminAccess   = role.includes('ADMIN')
  const hasTrainerAccess = role.includes('TRAINER') || hasAdminAccess
  const hasUserAccess    = role.includes('USER') || hasTrainerAccess

  const handleLogout = () => {
    logout()
    // 필요 시 서버 로그아웃 엔드포인트가 있으면 호출하고,
    // 여기서는 JWT라서 클라이언트 상태만 지우면 충분.
    window.location.href = '/'
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-background-light dark:bg-background-dark border-b border-gray-700 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={pfLogo} alt="Protein Friends" className="w-8 h-8" />
          <h1 className="font-bold text-lg text-white">Protein Friends</h1>
        </Link>
      </div>

      <nav className="flex items-center gap-6 text-sm text-gray-200">
        {!isLoggedIn ? (
          <>
            <Link to="/login">로그인</Link>
            <Link to="/auth/register">회원가입</Link>
          </>
        ) : isLoadingUser ? (
          <span>정보 불러오는 중...</span>
        ) : profileRequired ? (
          <>
            <Link to="/auth/complete-profile">정보 입력</Link>
            <button onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <>
            {hasAdminAccess && <Link to="/admin">관리자</Link>}
            {hasTrainerAccess && <Link to="/trainer">트레이너</Link>}
            {hasUserAccess && <Link to="/user/profile">내정보</Link>}
            <button onClick={handleLogout}>로그아웃</button>
          </>
        )}
      </nav>
    </header>
  )
}

export default Navbar