// src/App.jsx
import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import { RequireAuth, RequireRole } from './components/guards'
import Navbar from './components/Navbar'  // 경로 오타 수정!
import LoginForm from './components/LoginForm'
import SignUpForm from './components/SignUpForm'
import FindIdForm from './components/FindIdForm'
import ResetPasswordForm from './components/ResetPasswordForm'

// 페이지가 아직 없다면 임시 컴포넌트로 대체해도 됩니다.
const MyPage = () => <div>마이페이지</div>
const AdminDash = () => <div>관리자 대시보드</div>
const TrainerDash = () => <div>트레이너 대시보드</div>

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <main className="p-8 text-white">
        <Routes>
          <Route path="/" element={<div>홈</div>} />
          <Route path="/members" element={<div>회원 목록</div>} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/auth/register" element={<SignUpForm />} />
          <Route path="/auth/find-id" element={<FindIdForm />} />
          <Route path="/auth/reset-password" element={<ResetPasswordForm />} />
          <Route path="/trainers" element={<div>트레이너 목록</div>} />
          <Route path="/settings" element={<div>설정 페이지</div>} />

          {/* 보호 구간 */}
          <Route element={<RequireAuth />}>
            <Route path="/me" element={<MyPage />} />

            <Route element={<RequireRole anyOf={['ROLE_ADMIN']} />}>
              <Route path="/admin/*" element={<AdminDash />} />
            </Route>

            <Route element={<RequireRole anyOf={['ROLE_TRAINER', 'ROLE_ADMIN']} />}>
              <Route path="/trainer/*" element={<TrainerDash />} />
            </Route>
          </Route>
        </Routes>
      </main>
    </>
  )
}