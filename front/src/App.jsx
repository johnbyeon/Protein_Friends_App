import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/navbar/Navbar'
import LeftSidebar from './components/LeftSidebar'
import OAuthMessageBridge from './components/OAuthMessageBridge'
import HomePopup from './components/HomePopup'
import { initAuthTimers, useAuthStore } from './stores/authStore'
import AppRoutes from './routes'
import "./styles/lightStreaks.css";


export default function App() {
    const location = useLocation()
    const { user, token, setUser } = useAuthStore()
    const [showPopup, setShowPopup] = useState(false)
    const [popups, setPopups] = useState([])

    // 홈 페이지인지 확인 (사이드바 표시 여부 결정)
    const isHomePage = location.pathname === '/home' || location.pathname === '/'
  
    useEffect(() => {
      if (user?.role) {
        // role은 이미 ROLE_이 빠진 상태 (ex. "USER", "TRAINER", "ADMIN")
        let role = user.role.toLowerCase()
  
        // 트레이너를 관리자 계열로 통합
        if (role === 'trainer') role = 'admin'
  
        document.documentElement.setAttribute('data-role', role)
      } else {
        // 로그아웃 시 초기화
        document.documentElement.removeAttribute('data-role')
      }
    }, [user])

    // 앱 로드 시 최신 사용자 정보 가져오기 (profilePicture 포함)
    useEffect(() => {
      const refreshUserInfo = async () => {
        if (!token) return

        try {
          const base = import.meta.env.VITE_API_BASE ?? ''
          const res = await fetch(`${base}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const me = await res.json()
            setUser(me)
            console.log('✅ 앱 로드 시 사용자 정보 새로고침 (profilePicture 포함)', me)
          }
        } catch (e) {
          console.error('❌ 사용자 정보 새로고침 실패', e)
        }
      }

      refreshUserInfo()
    }, [token, setUser])

    // 팝업 데이터 가져오기 (로그인한 사용자만)
    useEffect(() => {
      const fetchPopups = async () => {
        if (!token || !user) return

        try {
          const base = import.meta.env.VITE_API_BASE ?? ''
          const res = await fetch(`${base}/api/boards/popups`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          
          if (res.ok) {
            const popupData = await res.json()
            console.log('✅ 팝업 데이터 로드:', popupData)
            console.log('🔍 팝업 데이터 타입:', typeof popupData)
            console.log('🔍 팝업 데이터 isArray:', Array.isArray(popupData))
            
            if (Array.isArray(popupData) && popupData.length > 0) {
              console.log('🔍 첫 번째 팝업 데이터:', popupData[0])
              console.log('🔍 첫 번째 팝업 키들:', Object.keys(popupData[0]))
              console.log('🔍 첫 번째 팝업 ptitle:', popupData[0].ptitle)
              console.log('🔍 첫 번째 팝업 pcontent:', popupData[0].pcontent)
              console.log('🔍 첫 번째 팝업 pimageUrl:', popupData[0].pimageUrl)
              console.log('🔍 첫 번째 팝업 ptypeName:', popupData[0].ptypeName)
            }
            
            // 오늘 하루 보지 않기로 설정된 팝업 필터링
            const today = new Date().toDateString()
            const todayHiddenPopups = JSON.parse(localStorage.getItem('todayHiddenPopups') || '[]')
            console.log('🔍 오늘 숨겨진 팝업 IDs:', todayHiddenPopups)
            
            const activePopups = popupData.filter(popup => 
              !todayHiddenPopups.includes(popup.pid)
            )
            
            console.log('🔍 활성 팝업들:', activePopups)
            console.log('🔍 활성 팝업 개수:', activePopups.length)
            
            if (activePopups.length > 0) {
              setPopups(activePopups)
              setShowPopup(true)
            }
          }
        } catch (e) {
          console.error('❌ 팝업 데이터 로드 실패:', e)
        }
      }

      // 로그인 상태가 변경될 때마다 팝업 체크
      if (user && token) {
        fetchPopups()
      }
    }, [user, token])

  console.log('🔥 VITE_SERVER_ORIGIN:', import.meta.env.VITE_SERVER_ORIGIN)
  useEffect(() => {
    initAuthTimers()
  }, [])

  useEffect(() => {
    const { loginFromResponse } = useAuthStore.getState()
    if (!loginFromResponse) {
      console.error('❌ loginFromResponse not found in store')
      return
    }

    const listener = (event) => {
      console.log('[🌍 Global OAuth Message Received]', event.origin, event.data)
      if (!event.data?.access_token) return
      try {
        loginFromResponse(event.data)
        console.log('✅ Global loginFromResponse called from OAuth message')
      } catch (err) {
        console.error('⚠️ loginFromResponse execution failed:', err)
      }
    }
    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [])

  // 팝업 닫기 핸들러
  const handleClosePopup = () => {
    setShowPopup(false)
  }

  // 오늘 하루 보지 않기 핸들러
  const handleTodayClosePopup = () => {
    // localStorage 테스트
    try {
      localStorage.setItem('test', '123')
      const testValue = localStorage.getItem('test')
      console.log('🔍 localStorage 테스트:', testValue)
      localStorage.removeItem('test')
    } catch (e) {
      console.error('❌ localStorage 에러:', e)
      alert('localStorage를 사용할 수 없습니다. 브라우저 설정을 확인해주세요.')
      return
    }
    
    const today = new Date().toDateString()
    let todayHiddenPopups = JSON.parse(localStorage.getItem('todayHiddenPopups') || '[]')
    
    // null, undefined, 숫자가 아닌 값들 필터링
    todayHiddenPopups = todayHiddenPopups.filter(id => id !== null && id !== undefined && typeof id === 'number')
    
    console.log('🔍 [오늘 하루 보지 않기] 오늘 날짜:', today)
    console.log('🔍 [오늘 하루 보지 않기] 기존 숨겨진 팝업 (정리 후):', todayHiddenPopups)
    console.log('🔍 [오늘 하루 보지 않기] 현재 팝업 IDs:', popups.map(p => p.pid))
    
    // 현재 팝업들을 오늘 하루 보지 않기 목록에 추가
    const newHiddenPopups = [...new Set([...todayHiddenPopups, ...popups.map(p => p.pid)])]
    
    console.log('🔍 [오늘 하루 보지 않기] 새로 숨겨질 팝업 IDs:', newHiddenPopups)
    
    try {
      localStorage.setItem('todayHiddenPopups', JSON.stringify(newHiddenPopups))
      
      // 저장 확인
      const saved = localStorage.getItem('todayHiddenPopups')
      console.log('🔍 [오늘 하루 보지 않기] localStorage 저장 확인:', saved)
      
      // Application 탭에서 직접 확인할 수 있도록 모든 localStorage 출력
      console.log('🔍 전체 localStorage:', { ...localStorage })
      
      if (!saved) {
        console.error('❌ localStorage 저장 실패!')
        alert('팝업 숨기기 설정에 실패했습니다.')
      } else {
        console.log('✅ localStorage 저장 성공!')
      }
    } catch (e) {
      console.error('❌ localStorage 저장 에러:', e)
      alert('팝업 숨기기 설정에 실패했습니다.')
    }
  }

  return (
    <>
      {/* 전역 OAuth 메시지 브리지: 팝업에서 postMessage 수신 */}
      <OAuthMessageBridge />
      
      {/* 홈팝업 */}
      {showPopup && (
        <HomePopup
          popups={popups}
          onClose={handleClosePopup}
          onTodayClose={handleTodayClosePopup}
        />
      )}
      
      <Navbar />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* 홈 페이지가 아닐 때만 사이드바 표시 */}
        {!isHomePage && <LeftSidebar />}
        
        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 overflow-auto">
          <AppRoutes />
        </div>
      </div>
    </>
  )

}
