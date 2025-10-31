// src/routes/AuthRoutes.jsx
import { Route, Navigate } from 'react-router-dom'
import PublicOnlyRoute from './PublicOnlyRoute'
import ProtectedRoute from './ProtectedRoute'
import LoginForm from '../pages/LoginForm'
import SignUpForm from '../pages/SignUpForm'
import CompleteProfile from '../pages/CompleteProfile'

export const AuthRoutes = [
  // 비로그인만 접근
  <Route key="login" path="/login" element={<PublicOnlyRoute element={<LoginForm />} />} />,
  <Route key="register" path="/auth/register" element={<PublicOnlyRoute element={<SignUpForm />} />} />,

  // 로그인 필수 + 프로필 미완성만 접근
  <Route
    key="complete-profile"
    path="/auth/complete-profile"
    element={
      <ProtectedRoute
        element={<CompleteProfile />}
        bypassProfileCheck={true} // ← 이 페이지는 profileRequired여도 들어와야 함
      />
    }
  />,

  // 편의: /logout 같은 페이지 만들면 여기에 PublicOnly/Protected로 추가
]