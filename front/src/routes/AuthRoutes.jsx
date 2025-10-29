// src/routes/AuthRoutes.jsx 로그인 회원가입관련
import { Route } from 'react-router-dom'
import LoginForm from '../pages/LoginForm'
import SignUpForm from '../pages/SignUpForm'
import CompleteProfile from '../pages/CompleteProfile'
import Home from '../pages/Home'

export const AuthRoutes = [
  <Route key="home" path="/" element={<Home />} />,
  <Route key="login" path="/login" element={<LoginForm />} />,
  <Route key="register" path="/auth/register" element={<SignUpForm />} />,
  <Route key="complete-profile" path="/auth/complete-profile" element={<CompleteProfile />} />,
]
