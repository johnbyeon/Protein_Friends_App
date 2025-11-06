// src/pages/pos/PosMembership.jsx
import React, { useEffect, useState } from "react"
import { sellMembership, get, getViewUrl } from "../../lib/api"
import { useAuthStore } from "../../stores/authStore"

// S3 이미지 컴포넌트
function S3Image({ s3Key, alt, className, ...props }) {
  const [imageUrl, setImageUrl] = useState("")
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!s3Key) {
      setError(true)
      return
    }

    const fetchImageUrl = async () => {
      try {
        const url = await getViewUrl(s3Key)
        setImageUrl(url)
        setError(false)
      } catch (err) {
        console.error("Failed to fetch image URL:", err)
        setError(true)
      }
    }

    fetchImageUrl()
  }, [s3Key])

  if (error || !imageUrl) {
    return (
      <div className={`bg-gray-600 flex items-center justify-center ${className}`} {...props}>
        <span className="material-symbols-outlined text-gray-400 text-2xl">image</span>
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt || "회원권 이미지"}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  )
}

export default function PosMembership() {
  const { user } = useAuthStore()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedMembership, setSelectedMembership] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [memberships, setMemberships] = useState([])

  // 시작일 초기값 오늘 날짜 설정
  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    setStartDate(`${year}-${month}-${day}`)
    
    // 회원권 목록 조회
    fetchMemberships()
  }, [])

  const fetchMemberships = async () => {
    try {
      const response = await get('/api/admin/memberships')
      if (response.ok) {
        const data = await response.json()
        setMemberships(data.filter(m => m.isActive)) // 활성화된 회원권만
      }
    } catch (error) {
      console.error('회원권 목록 조회 실패:', error)
    }
  }



  // 종료일 계산
  useEffect(() => {
    if (!selectedMembership) {
      setEndDate("")
      return
    }
    if (!startDate) return

    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + selectedMembership.membershipDurationDays)
    const formattedEnd = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(
      end.getDate()
    ).padStart(2, "0")}`
    setEndDate(formattedEnd)
  }, [selectedMembership, startDate])

  const handleSearchMember = async () => {
    if (!searchTerm.trim()) {
      alert("검색어를 입력하세요")
      return
    }

    try {
      const res = await get(`/api/users/search?q=${encodeURIComponent(searchTerm)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data)
        setShowSearchResults(true)
      } else {
        alert("회원 검색 실패")
      }
    } catch (err) {
      console.error("회원 검색 에러:", err)
      alert("회원 검색 중 오류 발생")
    }
  }

  const handleSelectMember = (user) => {
    const userId = user.uId || user.uid
    setSelectedMember({
      id: userId,
      name: user.name,
      phone: user.phone || user.phoneNumber,
      email: user.email,
      profileImage: user.profileImage || null
    })
    setShowSearchResults(false)
    setSearchTerm(`${user.name} (${user.email})`)
  }

  const handleSellMembership = async () => {
    if (!selectedMember || !selectedMembership || !startDate || !endDate) {
      alert("모든 필드를 입력해주세요.")
      return
    }

    try {
      setLoading(true)
      
      const membershipData = {
        userId: selectedMember.id,
        membershipId: selectedMembership.membershipId,
        membershipName: selectedMembership.membershipName,
        membershipDurationDays: selectedMembership.membershipDurationDays,
        startDate: startDate,
        endDate: endDate,
        price: selectedMembership.membershipPrice,
        salePrice: selectedMembership.membershipSalePrice
      }

      const result = await sellMembership(membershipData)
      alert(`회원권이 성공적으로 판매되었습니다! (기록ID: ${result.recordId})`)
      
      // 폼 초기화
      setSelectedMember(null)
      setSearchTerm("")
      setSelectedMembership(null)
      setStartDate("")
      setEndDate("")
      
    } catch (error) {
      console.error("회원권 판매 실패:", error)
      alert("회원권 판매에 실패했습니다: " + error.message)
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="flex min-h-screen flex-col bg-background-dark text-text-light">
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto w-full max-w-2xl space-y-8 rounded-2xl border border-border-dark/60 bg-background-dark/60 p-10 backdrop-blur">
          <header>
            <p className="text-sm uppercase tracking-widest text-primary/80">Trainer POS</p>
            <h1 className="text-3xl font-bold text-text-light">기간제 회원권 판매</h1>
            <p className="mt-2 text-sm text-gray-400">
              회원에게 기간제 회원권을 직접 판매하고 매출을 기록합니다.
            </p>
          </header>
          {/* 회원 검색 */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-text-light">회원 검색</label>
            <div className="flex w-full items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="회원 이름 또는 연락처를 입력하세요"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-3 pr-10 text-base text-text-light placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="material-symbols-outlined text-gray-400">search</span>
                </div>
              </div>
              <button 
                onClick={handleSearchMember}
                className="flex h-12 cursor-pointer items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white hover:bg-primary/90 transition-colors"
              >
                검색
              </button>
            </div>

            {/* 검색 결과 */}
            {showSearchResults && Array.isArray(searchResults) && searchResults.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-border-dark/60 rounded-lg bg-background-dark/60">
                {searchResults.map((user) => (
                  <div
                    key={user.uId || user.uid}
                    onClick={() => handleSelectMember(user)}
                    className="px-4 py-3 hover:bg-background-dark/80 cursor-pointer text-sm text-text-light border-b border-border-dark/30 last:border-b-0"
                  >
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                    {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border-dark/60 my-6" />

          {/* 회원 정보 */}
          <div className="space-y-6" id="member-info">
            {selectedMember ? (
              <div className="flex items-center gap-4">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-16"
                  style={{
                    backgroundImage: `url("${selectedMember.profileImage}")`,
                  }}
                ></div>
                <div>
                  <p className="text-lg font-bold text-text-light">{selectedMember.name}</p>
                  <p className="text-sm text-gray-400">{selectedMember.phone}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="bg-gray-600 rounded-full size-16 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-400">person</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-400">회원을 검색해주세요</p>
                </div>
              </div>
            )}

            {/* 회원권 선택 */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-text-light">회원권 선택</h4>
              {memberships.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  등록된 회원권이 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {memberships.map((membership) => (
                    <label
                      key={membership.membershipId}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-150 ${
                        selectedMembership?.membershipId === membership.membershipId
                          ? "border-primary bg-primary/20"
                          : "border-border-dark/60 hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedMembership(membership)}
                    >
                      <input
                        type="radio"
                        name="membership"
                        className="form-radio text-primary bg-background-dark/60 border-border-dark/60 focus:ring-primary"
                        checked={selectedMembership?.membershipId === membership.membershipId}
                        readOnly
                      />
                      
                      {/* 회원권 이미지 */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <S3Image
                          s3Key={membership.membershipPicUrl}
                          alt={membership.membershipName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <span className="font-medium text-text-light block">{membership.membershipName}</span>
                          <span className="text-sm text-gray-400">{membership.membershipDurationDays}일</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-primary">
                            ₩{(membership.membershipPrice - membership.membershipSalePrice).toLocaleString()}
                          </div>
                          {membership.membershipSalePrice > 0 && (
                            <div className="text-sm text-gray-400 line-through">
                              ₩{membership.membershipPrice.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 날짜 */}
            <div className="grid gap-6 md:grid-cols-2">
               <div className="space-y-2">
                 <label className="block text-sm font-medium text-text-light">회원권 시작일</label>
                 <div className="relative">
                   <input
                     type="date"
                     id="start-date"
                     value={startDate}
                     onChange={(e) => setStartDate(e.target.value)}
                     className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-3 pr-12 text-base text-text-light focus:border-primary focus:ring-primary cursor-pointer"
                   />
                   <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" onClick={() => document.getElementById('start-date').showPicker()}>
                     <span className="material-symbols-outlined text-primary text-xl">
                       calendar_month
                     </span>
                   </div>
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-medium text-text-light">회원권 만료일</label>
                 <div className="relative">
                   <input
                     type="date"
                     id="end-date"
                     value={endDate}
                     onChange={(e) => setEndDate(e.target.value)}
                     min={startDate}
                     disabled
                     className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-3 pr-12 text-base text-text-light focus:border-primary focus:ring-primary disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                   />
                   <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                     <span className="material-symbols-outlined text-gray-400 text-xl">
                       calendar_month
                     </span>
                   </div>
                 </div>
               </div>
            </div>

            {/* 금액 및 버튼 */}
            <div className="border-t border-border-dark/60 pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg text-gray-400">총 금액</span>
                <span className="text-3xl font-bold text-primary">
                  {selectedMembership ? `₩${(selectedMembership.membershipPrice - selectedMembership.membershipSalePrice).toLocaleString()}` : "₩0"}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSellMembership}
            disabled={loading || !selectedMember || !selectedMembership || !startDate || !endDate}
            className="w-full flex h-14 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-base font-bold text-white hover:bg-primary/90 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? "처리 중..." : "회원권 추가하기"}
          </button>
        </div>
      </main>
    </div>
  )
}
