// src/routes/AdminRoutes.jsx
import { Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AdminDashboard from '../pages/AdminDashboard'

export const AdminRoutes = [
  <Route
    key="admin-dashboard"
    path="/admin/dashboard"
    element={<ProtectedRoute element={<AdminDashboard />} role="ROLE_ADMIN" />}
  />,
]
