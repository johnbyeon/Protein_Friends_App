// src/routes/PublicRoutes.jsx
import { Route } from 'react-router-dom'
import LoginForm from '../pages/LoginForm'
import SignUpForm from '../pages/SignUpForm'

export const PublicRoutes = [
  <Route key="home" path="/login" element={<LoginForm />} />,
  <Route key="signup" path="/signup" element={<SignUpForm />} />,
]
    