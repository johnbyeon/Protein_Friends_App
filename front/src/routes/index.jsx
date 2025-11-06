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
import Calories from '../pages/Calories'
import DietPlans from '../pages/DietPlans'
import MyInquiries from '../pages/user/support/MyInquiries'
import InquiryDetail from '../pages/user/support/InquiryDetail'
import NewInquiry from '../pages/user/support/NewInquiry'
import FaqList from '../pages/user/support/FaqList'

// Board Components
import BoardList from '../components/boards/BoardList'
import BoardDetail from '../components/boards/BoardDetail'
import BoardForm from '../components/boards/BoardForm'
import AdminBoardList from '../components/boards/AdminBoardList'
import BoardTypeManagement from '../pages/admin/BoardTypeManagement'

// Admin/Trainer Pages
import AdminDashboard from '../pages/AdminDashboard'
import UploadTest from '../pages/UploadTest'
import TrainerCreate from '../pages/admin/trainers/TrainerCreate'
import TrainerProfile from '../pages/trainer/TrainerProfile'
import TrainerInfo from '../pages/trainer/TrainerInfo'
import InquiryManagement from '../pages/admin/support/InquiryManagement'
import InquiryReply from '../pages/admin/support/InquiryReply'
import FaqManagement from '../pages/admin/support/FaqManagement'
import ClassSchedule from '../pages/admin/classes/ClassSchedule'
import PosPT_Pass from '../pages/pos/PosPT_Pass'
import PosMembership from '../pages/pos/PosMembership'
import PtTicketManagement from '../pages/market/PtTicketManagement'
import MembershipManagement from '../pages/admin/market/MembershipManagement'

// Access & Branch Pages
import AccessCheck from '../pages/access/AccessCheck'
import BranchListPage from '../pages/branches/BranchListPage'
import BranchDetailPage from '../pages/branches/BranchDetailPage' 
import BranchManagement from '../pages/admin/centers/BranchManagement'
import BranchCreate from '../pages/admin/centers/BranchCreate'
import BranchEdit from '../pages/admin/centers/BranchEdit'

export default function AppRoutes() {
  return (
    <Routes>
      {/* 루트: 로그인 여부에 따라 분기 */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ==================== PUBLIC (비로그인 전용) ==================== */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<SignUpForm />} />
        <Route path="/find-id" element={<FindIdForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
      </Route>

      {/* ==================== AUTH (로그인 필수) ==================== */}
      <Route path="/" element={<AuthLayout />}>
        {/* 프로필 완성 페이지 (프로필 미완성만 접근) */}
        <Route path="complete-profile" element={<CompleteProfile />} />

        {/* 공통 페이지 (모든 로그인 유저) */}
        <Route path="home" element={<Home />} />
        <Route path="my/info" element={<MyInfo />} />

        {/* ==================== 게시판 (공통) ==================== */}
        <Route path="boards/:typeAddressName" element={<BoardList />} />
        <Route path="boards/:typeAddressName/new" element={<BoardForm />} />
        <Route path="boards/:typeAddressName/:pId" element={<BoardDetail />} />
        <Route path="boards/:typeAddressName/:pId/edit" element={<BoardForm />} />

        {/* ==================== 공통 기능 ==================== */}
        <Route path="access" element={<AccessCheck />} />
        <Route path="branches" element={<BranchListPage />} />
        <Route path="branches/:gid" element={<BranchDetailPage />} />
        <Route path="calories" element={<Calories />} />
        <Route path="diet/plans" element={<DietPlans />} />

        {/* ==================== 고객센터 (유저용) ==================== */}
        <Route path="support/inquiries" element={<MyInquiries />} />
        <Route path="support/inquiries/new" element={<NewInquiry />} />
        <Route path="support/inquiries/:id" element={<InquiryDetail />} />
        <Route path="support/faqs" element={<FaqList />} />

          {/* ==================== USER 전용 ==================== */}
          <Route path="user">
            <Route
              path="support/inquiries"
              element={
                <RoleGuard allowedRoles={['USER']}>
                  <MyInquiries />
                </RoleGuard>
              }
            />
            <Route
              path="support/inquiries/new"
              element={
                <RoleGuard allowedRoles={['USER']}>
                  <NewInquiry />
                </RoleGuard>
              }
            />
            <Route
              path="support/inquiries/:id"
              element={
                <RoleGuard allowedRoles={['USER']}>
                  <InquiryDetail />
                </RoleGuard>
              }
            />
            <Route
              path="home"
              element={
                <RoleGuard allowedRoles={['USER']}>
                  <Home />
                </RoleGuard>
              }
            />
          </Route>

          {/* ==================== USER 전용 (my 경로) ==================== */}
          <Route
            path="my/info"
            element={
              <RoleGuard allowedRoles={['USER']}>
                <MyInfo />
              </RoleGuard>
            }
          />
          <Route
            path="my/coupons"
            element={
              <RoleGuard allowedRoles={['USER']}>
                <MyCoupons />
              </RoleGuard>
            }
          />
          <Route
            path="my/memberships"
            element={
              <RoleGuard allowedRoles={['USER']}>
                <MyMemberships />
              </RoleGuard>
            }
          />
          <Route
            path="my/pt-passes"
            element={
              <RoleGuard allowedRoles={['USER']}>
                <MyPTPasses />
              </RoleGuard>
            }
          />
          <Route
            path="my/inbody"
            element={
              <RoleGuard allowedRoles={['USER']}>
                <MyInbody />
              </RoleGuard>
            }
          />

        {/* ==================== TRAINER 전용 ==================== */}
        <Route path="trainer">
          {/* 트레이너 대시보드 */}
          <Route
            path="dashboard"
            element={
              <RoleGuard allowedRoles={['TRAINER']}>
                <AdminDashboard />
              </RoleGuard>
            }
          />

          {/* 트레이너 게시판 */}
          <Route
            path="boards/:typeAddressName"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'TRAINER']}>
                <AdminBoardList />
              </RoleGuard>
            }
          />
          <Route
            path="boards/:typeAddressName/new"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'TRAINER']}>
                <BoardForm />
              </RoleGuard>
            }
          />
          <Route
            path="boards/:typeAddressName/:pId/edit"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'TRAINER']}>
                <BoardForm />
              </RoleGuard>
            }
          />

          {/* 게시판 타입 관리 */}
          <Route
            path="board-types"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'TRAINER']}>
                <BoardTypeManagement />
              </RoleGuard>
            }
          />

          {/* 트레이너 정보 조회 */}
          <Route
            path="trainers"
            element={
              <RoleGuard allowedRoles={['TRAINER']}>
                <TrainerInfo />
              </RoleGuard>
            }
          />

          {/* 트레이너 본인 프로필 수정 */}
          <Route
            path="profile"
            element={
              <RoleGuard allowedRoles={['TRAINER']}>
                <TrainerProfile />
              </RoleGuard>
            }
          />

          {/* 마켓 관리 - PT 이용권 관리 */}
          <Route
            path="market/pt-tickets"
            element={
              <RoleGuard allowedRoles={['TRAINER']}>
                <PtTicketManagement />
              </RoleGuard>
            }
          />

          {/* 마켓 관리 - 기간제 회원권 관리 */}
          <Route
            path="market/memberships"
            element={
              <RoleGuard allowedRoles={['TRAINER']}>
                <MembershipManagement />
              </RoleGuard>
            }
          />

          {/* 현장 판매 */}
          <Route
            path="pos/pt-pass"
            element={
              <RoleGuard allowedRoles={['TRAINER']}>
                <PosPT_Pass />
              </RoleGuard>
            }
          />
          <Route
            path="pos/membership"
            element={
              <RoleGuard allowedRoles={['TRAINER']}>
                <PosMembership />
              </RoleGuard>
            }
          />

          {/* 기타 트레이너 기능 */}
          <Route
            path="schedule"
            element={
              <RoleGuard allowedRoles={['TRAINER']}>
                <div>트레이너 일정 페이지 (개발 예정)</div>
              </RoleGuard>
            }
          />
          <Route
            path="upload"
            element={
              <RoleGuard allowedRoles={['TRAINER']}>
                <UploadTest />
              </RoleGuard>
            }
          />

          {/* 고객센터 - 1:1 문의 관리 */}
          <Route
            path="support/inquiries"
            element={
              <RoleGuard allowedRoles={['TRAINER']}>
                <InquiryManagement />
              </RoleGuard>
            }
          />
          <Route
            path="support/inquiries/:id/reply"
            element={
              <RoleGuard allowedRoles={['TRAINER']}>
                <InquiryReply />
              </RoleGuard>
            }
          />
                    {/* 고객센터 - FAQ 관리 (ADMIN 전용) */}
          <Route
            path="support/faqs"
            element={
              <RoleGuard allowedRoles={['TRAINER']}>
                <FaqManagement />
              </RoleGuard>
            }
          />
        </Route>

        {/* ==================== ADMIN 전용 ==================== */}
        <Route path="/admin" element={<AuthLayout />}>
          {/* ADMIN만 접근 가능한 페이지 */}
          <Route
            path="dashboard"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </RoleGuard>
            }
          />

          {/* 관리자 게시판 */}
          <Route
            path="boards/:typeAddressName"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'TRAINER']}>
                <AdminBoardList />
              </RoleGuard>
            }
          />
          <Route
            path="boards/:typeAddressName/new"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'TRAINER']}>
                <BoardForm />
              </RoleGuard>
            }
          />
          <Route
            path="boards/:typeAddressName/:pId/edit"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'TRAINER']}>
                <BoardForm />
              </RoleGuard>
            }
          />

          {/* 게시판 타입 관리 */}
          <Route
            path="board-types"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'TRAINER']}>
                <BoardTypeManagement />
              </RoleGuard>
            }
          />

          {/* 지점 관리 */}
          <Route
            path="centers/branches"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <BranchManagement />
              </RoleGuard>
            }
          />
           <Route
             path="centers/branches/new"
             element={
               <RoleGuard allowedRoles={['ADMIN']}>
                 <BranchCreate />
               </RoleGuard>
             }
           />
           <Route
             path="centers/branches/:id/edit"
             element={
               <RoleGuard allowedRoles={['ADMIN']}>
                 <BranchEdit />
               </RoleGuard>
             }
           />

          {/* 트레이너 관리 */}
          <Route
            path="trainers"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <TrainerInfo />
              </RoleGuard>
            }
          />
          <Route
            path="trainers/new"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <TrainerCreate />
              </RoleGuard>
            }
          />

          {/* 고객센터 - 1:1 문의 관리 */}
          <Route
            path="support/inquiries"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <InquiryManagement />
              </RoleGuard>
            }
          />
          <Route
            path="support/inquiries/:id/reply"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'TRAINER']}>
                <InquiryReply />
              </RoleGuard>
            }
          />
          
          {/* 고객센터 - FAQ 관리 (ADMIN 전용) */}
          <Route
            path="support/faqs"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <FaqManagement />
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
          {/* 현장 판매 */}
          <Route
            path="pos/pt-pass"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <PosPT_Pass />
              </RoleGuard>
            }
          />
          <Route
            path="pos/membership"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <PosMembership />
              </RoleGuard>
            }
          />

          {/* 수업 관리 */}
          <Route
            path="classes/schedule"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <ClassSchedule />
              </RoleGuard>
            }
          />

          {/* 추가 관리자 페이지들... */}
        </Route>
      </Route>

      {/* 404 - 존재하지 않는 경로 */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
