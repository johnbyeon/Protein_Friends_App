import React from "react";
import { Link } from "react-router-dom";
import pfLogo from '../assets/pflogo.svg'
import { useAuthStore } from '../stores/authStore'

const Navbar = () => {
  const { user, logout } = useAuthStore()
  const role = user?.role

  const hasAdminAccess = role?.includes('ADMIN')
  const hasTrainerAccess = role?.includes('TRAINER') || hasAdminAccess
  const hasUserAccess = role?.includes('USER') || hasTrainerAccess

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-background-light dark:bg-background-dark border-b border-gray-700 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={pfLogo} alt="Protein Friends" className="w-8 h-8" />
          <h1 className="font-bold text-lg text-white">Protein Friends</h1>
        </Link>
      </div>

      <nav className="flex items-center gap-6 text-sm text-gray-200">
        {!user ? (
          <>
            <Link to="/login">로그인</Link>
            <Link to="/auth/register">회원가입</Link>
          </>
        ) : (
          <>
            {hasUserAccess && <Link to="/me">내정보</Link>}
            {hasTrainerAccess && <Link to="/users">유저관리</Link>}
            {hasAdminAccess && <Link to="/admin">관리자</Link>}
            <button onClick={logout} className="text-red-400 hover:text-red-500">로그아웃</button>
          </>
        )}
      </nav>
    </header>
  )
}

export default Navbar
