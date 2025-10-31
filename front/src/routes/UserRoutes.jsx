// src/routes/UserRoutes.jsx
import { Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import Home from '../pages/Home'
import MyInfo from '../pages/MyInfo'
import MyCoupons from '../pages/MyCoupons'

export const UserRoutes = [
  <Route
    key="home"
    path="/"
    element={<ProtectedRoute element={<Home />} />}
  />,
  <Route
    key="myinfo"
    path="/user/me"
    element={<ProtectedRoute element={<MyInfo />} />}
  />,
   <Route
    key="myCoupons"
    path=" /my/coupons"
    element={<ProtectedRoute element={<MyCoupons />} />}
  />,
]