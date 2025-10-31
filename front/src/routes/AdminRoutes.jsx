// src/routes/AdminRoutes.jsx
import { Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AdminDashboard from '../pages/AdminDashboard'

export const AdminRoutes = [
  // 관리자만
  <Route
    key="admin-dashboard"
    path="/admin/dashboard"
    element={<ProtectedRoute element={<AdminDashboard />} allow={['ADMIN']} />}
  />,

  // 트레이너 & 관리자
  <Route
    key="trainer-dashboard"
    path="/admin/dashboard"
    element={<ProtectedRoute element={<AdminDashboard />} allow={['TRAINER','ADMIN']} />}
  />,
]