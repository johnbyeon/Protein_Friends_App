import React from "react";
import { Link } from "react-router-dom";
import pfLogo from '../assets/pflogo.svg'
import { useAuthStore } from '../stores/authStore'
import { useProfileGuard } from '../hooks/useProfileGuard'
import userprofile from '../assets/user_profile.svg'
import UserNavbar from "./UserNavbar";

const Navbar = () => {



  const { user, token, logout, profileRequired } = useAuthStore()
  const role = user?.role || ''
  const isLoggedIn = !!token && !!user

  console.log('[Navbar] user:', user)
  console.log('[Navbar] role:', role)
  // user가 null이면 아직 정보 로딩 중으로 간주
  const isLoadingUser = isLoggedIn && !user?.role

  const hasAdminAccess = role.includes('ADMIN')
  const hasTrainerAccess = role.includes('TRAINER')
  const hasUserAccess = role.includes('USER')

  const handleLogout = () => {
    logout()
    // 필요 시 서버 로그아웃 엔드포인트가 있으면 호출하고,
    // 여기서는 JWT라서 클라이언트 상태만 지우면 충분.
    window.location.href = '/'
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 dark:bg-background-dark border border-primary/20 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={pfLogo} alt="Protein Friends" className="w-5 h-5" />
          <h1 className="font-bold text-lg text-gray-400">Protein Friends</h1>
        </Link>
      </div>
      {/* ===== Center: Main Navigation ===== */}
      <nav className="ml-10 flex-1 flex justify-left">
        <div className="flex items-center gap-8 text-sm font-medium text-gray-200">
          {isLoggedIn && !profileRequired && (
            <>
              {hasAdminAccess && <Link to="/admin/dashboard">관리자 대시보드</Link>}
              {hasTrainerAccess && <Link to="/trainer/schedule">트레이너 일정</Link>}
              {hasUserAccess && ( <UserNavbar/>)}
            </>
          )}

          {!isLoggedIn && (
            <>
            </>
          )}
        </div>
      </nav>

      <nav className="flex items-center gap-6 text-sm text-gray-200">
        <div class="relative group">
          <button class="flex items-center gap-2 focus:outline-none">
            <img src={userprofile} class="w-9 h-9 rounded-full border border-border-primary/20" alt="User" />
          </button>

          <div class="absolute right-0 mt-2 w-48 border border-border-primary/20 rounded-md shadow-lg
            bg-black text-white
            opacity-0 translate-y-1 group-hover:opacity-80 group-hover:translate-y-0 transition-all duration-200">
            {!isLoggedIn ? (
              <>
                <a href="/login" class="block px-4 py-2 text-sm hover:bg-primary/20">로그인</a>
                <a href="/register" class="block px-4 py-2 text-sm hover:bg-primary/20">회원가입</a>
              </>
            ) : isLoadingUser ? (
              <span>정보 불러오는 중...</span>
            ) : profileRequired ? (
              <>
                <a href="/auth/complete-profile" class="block px-4 py-2 text-sm hover:bg-primary/20">정보 입력</a>
                <button onClick={handleLogout} class="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-primary/20">로그아웃</button>
              </>
            ) : (
              <>
                {hasUserAccess && <a href="/user/me" class="block px-4 py-2 text-sm hover:bg-primary/20">내 정보</a>}
                <button onClick={handleLogout} class="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-primary/20">로그아웃</button>
                {hasAdminAccess && <a href="/user/me" class="block px-4 py-2 text-sm hover:bg-primary/20">관리자용</a>}
                {hasTrainerAccess && <a href="/user/me" class="block px-4 py-2 text-sm hover:bg-primary/20">트레이너용</a>}
              </>
            )}
          </div>
        </div>



      </nav>
    </header>
  )
}

export default Navbar