import React from "react";
import { Link } from "react-router-dom";
import pfLogo from '../../assets/pflogo.svg'
import admin_pflogo from '../../assets/admin_pflogo.svg'
import admin_user from '../../assets/admin_user.svg'
import { useAuthStore } from '../../stores/authStore'
import { useProfileGuard } from '../../hooks/useProfileGuard'
import userprofile from '../../assets/user_profile.svg'
import UserNavbar from "./UserNavbar";
import TrainerNavbar from "./TrainerNavbar";
import AdminNavbar from "./AdminNavbar";

const Navbar = () => {



  const { user, token, logout, profileRequired } = useAuthStore()
  const role = user?.role || ''
  const isLoggedIn = !!token && !!user

  console.log('[Navbar] user:', user)
  console.log('[Navbar] role:', role)
  console.log('[Navbar] profilePicture:', user?.profilePicture)
  // user가 null이면 아직 정보 로딩 중으로 간주
  const isLoadingUser = isLoggedIn && !user?.role

  const hasAdminAccess = role.includes('ADMIN')
  const hasTrainerAccess = role.includes('TRAINER')
  const hasUserAccess = role.includes('USER')

  const handleLogout = () => {
    logout()
    // 필요 시 서버 로그아웃 엔드포인트가 있으면 호출하고,
    // 여기서는 JWT라서 클라이언트 상태만 지우면 충분.
    window.location.href = '/login'
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 dark:bg-background-dark border border-primary/20 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          {(!hasAdminAccess && !hasTrainerAccess) && <img src={pfLogo} alt="Protein Friends" className="w-5 h-5" />}
          {(hasAdminAccess || hasTrainerAccess) && <img src={admin_pflogo} alt="Protein Friends" className="w-5 h-5" />}
          <h1 className="font-bold text-lg text-gray-400">Protein Friends</h1>
        </Link>
      </div>
      {/* ===== Center: Main Navigation ===== */}
      <nav className="ml-10 flex-1 flex justify-left">
        <div className="flex items-center gap-8 text-lg font-medium text-gray-200">
          {isLoggedIn && !profileRequired && (
            <>
              {hasAdminAccess && <AdminNavbar/>}
              {hasTrainerAccess && <TrainerNavbar/>}
              {hasUserAccess && ( <UserNavbar/>)}
            </>
          )}

          {!isLoggedIn && (
            <>
            </>
          )}
        </div>
      </nav>

      <nav className="flex items-center gap-6 text-lg text-gray-200">
        <div className="relative group">
          <button className="flex items-center gap-2 focus:outline-none">
            {!isLoggedIn && (
              <img src={userprofile} className="w-9 h-9 rounded-full border border-border-primary/20 object-cover" alt="User" />
            )}
            {isLoggedIn && user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                className="w-9 h-9 rounded-full border border-border-primary/20 object-cover" 
                alt="Profile" 
                onError={(e) => {
                  // 이미지 로드 실패 시 기본 이미지로 대체
                  e.target.src = (hasAdminAccess || hasTrainerAccess) ? admin_user : userprofile
                }}
              />
            ) : isLoggedIn && hasUserAccess && (
              <img src={userprofile} className="w-9 h-9 rounded-full border border-border-primary/20 object-cover" alt="User" />
            )}
            {isLoggedIn && !user?.profilePicture && (hasAdminAccess || hasTrainerAccess) && (
              <img src={admin_user} className="w-9 h-9 rounded-full border border-border-primary/20 object-cover" alt="Admin" />
            )}
          </button>

          <div className="absolute right-0 mt-2 w-48 border border-border-primary/20 rounded-md shadow-lg
            bg-black text-white
            opacity-0 scale-95 pointer-events-none group-hover:pointer-events-auto
            group-hover:opacity-80 group-hover:scale-100 group-hover:block transform transition-all duration-200 ease-out origin-top
            before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:block">
            {!isLoggedIn ? (
              <>
                <a href="/login" className="block px-4 py-2 text-lg hover:bg-primary/20">로그인</a>
                <a href="/register" className="block px-4 py-2 text-lg hover:bg-primary/20">회원가입</a>
              </>
            ) : isLoadingUser ? (
              <span>정보 불러오는 중...</span>
            ) : profileRequired ? ( 
              <>
                <a href="/complete-profile" className="block px-4 py-2 text-lg hover:bg-primary/20">정보 입력</a>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-lg text-red-400 hover:bg-primary/20">로그아웃</button>
              </>
            ) : (
              <>
                {hasUserAccess && (
                  <>
                    <a href="/my/info" className="block px-4 py-2 text-lg hover:bg-primary/20">정보보기</a>
                    <a href="/my/memberships" className="block px-4 py-2 text-lg hover:bg-primary/20">내 회원권 보기</a>
                    <a href="/my/pt-passes" className="block px-4 py-2 text-lg hover:bg-primary/20">PT횟수 이용권 보기</a>
                    <a href="/my/coupons" className="block px-4 py-2 text-lg hover:bg-primary/20">할인권 보기</a>
                    <a href="/my/inbody" className="block px-4 py-2 text-lg hover:bg-primary/20">인바디 데이터</a>
                  </>
                )}
                {hasTrainerAccess && <a href="/trainer/profile" className="block px-4 py-2 text-lg hover:bg-primary/20">트레이너 프로필 수정</a>}
                {hasAdminAccess && <a href="/admin/dashboard" className="block px-4 py-2 text-lg hover:bg-primary/20">관리자용</a>}
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-lg text-red-400 hover:bg-primary/20">로그아웃</button>
              </>
            )}
          </div>
        </div>



      </nav>
    </header>
  )
}

export default Navbar