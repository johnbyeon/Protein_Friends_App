import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AuthLayout from '../layouts/AuthLayout'
import RoleGuard from '../components/RoleGuard'

// Public Pages
import LoginForm from '../pages/LoginForm'
import SignUpForm from '../pages/SignUpForm'
import FindIdForm from '../pages/FindIdForm'
import ResetPasswordForm from '../pages/ResetPasswordForm'

// Auth Pages (로그인 필수)
import Home from '../pages/Home'
import CompleteProfile from '../pages/CompleteProfile'

// User Pages (USER만)
import MyInfo from '../pages/MyInfo'
import MyCoupons from '../pages/MyCoupons'
import MyMemberships from '../pages/MyMemberships'
import MyPTPasses from '../pages/MyPTPasses'
import MyInbody from '../pages/MyInbody'

// Admin/Trainer Pages
import AdminDashboard from '../pages/AdminDashboard'
import UploadTest from '../pages/UploadTest'

export default function AppRoutes() {
  return (
    <Routes>
      {/* 루트: 로그인 여부에 따라 분기 */}
      <Route path="/" element={<Navigate to="/app/home" replace />} />

      {/* ==================== PUBLIC (비로그인 전용) ==================== */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<SignUpForm />} />
        <Route path="/find-id" element={<FindIdForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
      </Route>

      {/* ==================== AUTH (로그인 필수) ==================== */}
      <Route path="/app" element={<AuthLayout />}>
        {/* 프로필 완성 페이지 (프로필 미완성만 접근) */}
        <Route path="complete-profile" element={<CompleteProfile />} />

        {/* 공통 페이지 (모든 로그인 유저) */}
        <Route path="home" element={<Home />} />

        {/* ==================== USER 전용 ==================== */}
        <Route path="user">
          <Route
            path="me"
            element={
              <RoleGuard allowedRoles={['USER']}>
                <MyInfo />
              </RoleGuard>
            }
          />
          <Route
            path="coupons"
            element={
              <RoleGuard allowedRoles={['USER']}>
                <MyCoupons />
              </RoleGuard>
            }
          />
          <Route
            path="memberships"
            element={
              <RoleGuard allowedRoles={['USER']}>
                <MyMemberships />
              </RoleGuard>
            }
          />
          <Route
            path="pt-passes"
            element={
              <RoleGuard allowedRoles={['USER']}>
                <MyPTPasses />
              </RoleGuard>
            }
          />
          <Route
            path="inbody"
            element={
              <RoleGuard allowedRoles={['USER']}>
                <MyInbody />
              </RoleGuard>
            }
          />
        </Route>

        {/* ==================== TRAINER 전용 ==================== */}
        <Route path="trainer">
          <Route
            path="upload"
            element={
              <RoleGuard allowedRoles={['TRAINER']}>
                <UploadTest />
              </RoleGuard>
            }
          />
          {/* 트레이너 전용 페이지 추가 시 여기에 */}
        </Route>

        {/* ==================== ADMIN 전용 ==================== */}
        <Route path="admin">
          {/* ADMIN만 접근 가능한 페이지 */}
          <Route
            path="dashboard"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </RoleGuard>
            }
          />

          {/* TRAINER + ADMIN 모두 접근 가능한 관리자 페이지 */}
          <Route
            path="shared/upload"
            element={
              <RoleGuard allowedRoles={['TRAINER', 'ADMIN']}>
                <UploadTest />
              </RoleGuard>
            }
          />
          {/* 추가 관리자 페이지들... */}
        </Route>
      </Route>

      {/* 404 - 존재하지 않는 경로 */}
      <Route path="*" element={<Navigate to="/app/home" replace />} />
    </Routes>
  )
}
