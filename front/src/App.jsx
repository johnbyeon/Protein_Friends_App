import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LoginForm from './pages/LoginForm'
import SignUpForm from './pages/SignUpForm'
import OAuthLogin from './pages/OAuthLogin'
import { initAuthTimers } from './stores/authStore'

export default function App() {
  useEffect(() => { initAuthTimers() }, [])

  return (
    <>
      <Navbar />
      <main className="text-white p-6">
        <Routes>
          <Route path="/" element={<OAuthLogin />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/auth/register" element={<SignUpForm />} />
        </Routes>
      </main>
    </>
  )
}
