import { useState } from 'react' 
import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import UploadTest from './pages/UploadTest'

function Home() {
  return (
    <section className="p-8">
      <h1 className="text-3xl font-extrabold">Home</h1>
      <p className="text-gray-600 mt-2">메인 페이지</p>
    </section>
  )
}

function About() {
  return (
    <section className="p-8">
      <h1 className="text-2xl font-bold">About</h1>
      <p className="text-gray-600 mt-2">소개 페이지</p>
    </section>
  )
}

function Shop() {
  return (
    <section className="p-8">
      <h1 className="text-2xl font-bold">Shop</h1>
      <p className="text-gray-600 mt-2">마켓 리스트</p>
    </section>
  )
}

function NotFound() {
  return (
    <section className="p-8">
      <h1 className="text-xl font-bold">404</h1>
      <p className="text-gray-600 mt-2">페이지를 찾을 수 없습니다.</p>
    </section>
  )
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* 간단한 네비게이션 */}
      <header className="p-4 border-b flex gap-4">
        <Link className="hover:underline" to="/">Home</Link>
        <Link className="hover:underline" to="/about">About</Link>
        <Link className="hover:underline" to="/shop">Shop</Link>
        <Link className="hover:underline" to="/upload-test">UploadTest</Link> 
      </header>

      {/* 라우팅 영역 */}
      <Routes>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="shop" element={<Shop />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
