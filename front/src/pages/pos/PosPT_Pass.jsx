// src/pages/pos/PosPT_Pass.jsx
import React, { useState, useEffect } from "react"
import { sellPtPass, getActivePtTickets, get, getViewUrl } from "../../lib/api"

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
      alt={alt || "PT 이용권 이미지"}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  )
}

export default function PosPT_Pass() {
  const [selectedTicket, setSelectedTicket] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [totalPrice, setTotalPrice] = useState("0원")
  const [selectedMember, setSelectedMember] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ptTickets, setPtTickets] = useState([])
  const [ticketsLoading, setTicketsLoading] = useState(true)

  useEffect(() => {
    fetchPtTickets()
  }, [])

  const fetchPtTickets = async () => {
    try {
      setTicketsLoading(true)
      const data = await getActivePtTickets()
      console.log('🔍 PT 이용권 목록:', data)
      setPtTickets(data || [])
    } catch (error) {
      console.error('PT 이용권 목록 조회 실패:', error)
      setPtTickets([])
    } finally {
      setTicketsLoading(false)
    }
  }



  const handleTicketChange = (ticket) => {
    setSelectedTicket(ticket.ptId)
    const finalPrice = ticket.ptPrice - ticket.ptSalePrice
    setTotalPrice(finalPrice.toLocaleString() + "원")
    
    // 시작일이 있으면 종료일 자동 계산
    if (startDate && ticket.ptDurationDays) {
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + ticket.ptDurationDays)
      setEndDate(endDate.toISOString().split('T')[0])
    }
  }

  const handleStartDateChange = (date) => {
    setStartDate(date)
    
    // 선택된 이용권이 있으면 종료일 자동 계산
    if (date && selectedTicket) {
      const selectedTicketData = ptTickets.find(t => t.ptId === selectedTicket)
      if (selectedTicketData && selectedTicketData.ptDurationDays) {
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + selectedTicketData.ptDurationDays)
        setEndDate(endDate.toISOString().split('T')[0])
      }
    }
  }

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
    console.log('🔍 선택된 회원:', user)
    const userId = user.uId || user.uid
    console.log('🆔 추출된 userId:', userId)

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

  const handleSellPtPass = async () => {
    if (!selectedMember || !selectedTicket || !startDate || !endDate) {
      alert("모든 필드를 입력해주세요.")
      return
    }

    const selectedTicketData = ptTickets.find(t => t.ptId === selectedTicket)

    try {
      setLoading(true)
      
       const ptPassData = {
         userId: selectedMember.id,
         ptServiceId: selectedTicketData.ptId,
         ptName: selectedTicketData.ptName,
         ptTotalCount: selectedTicketData.ptCount,
         startDate: startDate,
         endDate: endDate,
         price: selectedTicketData.ptPrice,
         salePrice: selectedTicketData.ptSalePrice
       }

      const result = await sellPtPass(ptPassData)
      alert(`PT 이용권이 성공적으로 판매되었습니다! (기록ID: ${result.recordId})`)
      
       // 폼 초기화
       setSelectedMember(null)
       setSearchTerm("")
       setSelectedTicket("")
       setStartDate("")
       setEndDate("")
       setTotalPrice("0원")
      
    } catch (error) {
      console.error("PT 이용권 판매 실패:", error)
      alert("PT 이용권 판매에 실패했습니다: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background-dark text-text-light">
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto w-full max-w-4xl space-y-8 rounded-2xl border border-border-dark/60 bg-background-dark/60 p-10 backdrop-blur">
          <header>
            <p className="text-sm uppercase tracking-widest text-primary/80">Trainer POS</p>
            <h1 className="text-3xl font-bold text-text-light">PT 이용권 현장 판매</h1>
            <p className="mt-2 text-sm text-gray-400">
              회원에게 PT 이용권을 직접 판매하고 매출을 기록합니다.
            </p>
          </header>

          {/* 회원 검색 */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-text-light">회원 검색</label>
            <div className="flex w-full items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="search"
                  placeholder="회원 이름 또는 이메일로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchMember())}
                  className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-3 pr-10 text-base text-text-light placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="material-symbols-outlined text-gray-400">
                    search
                  </span>
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

          {/* 이용권 정보 */}
          <div className="rounded-2xl border border-border-dark/60 bg-background-dark/60 p-6 space-y-6">
            <h3 className="text-xl font-bold text-text-light">이용권 정보</h3>

            <div className="grid gap-6 md:grid-cols-2">
              {/* 회원 정보 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-light">회원명</label>
                {selectedMember ? (
                   <div className="flex items-center gap-3 rounded-lg border border-border-dark/60 bg-background-dark/60 p-3">
                     {selectedMember.profileImage ? (
                       <div
                         className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                         style={{
                           backgroundImage: `url("${selectedMember.profileImage}")`,
                         }}
                       ></div>
                     ) : (
                       <div className="size-10 rounded-full bg-gray-600 flex items-center justify-center">
                         <span className="material-symbols-outlined text-gray-400 text-sm">person</span>
                       </div>
                     )}
                     <div>
                       <span className="block text-base text-text-light">{selectedMember.name}</span>
                       <span className="text-sm text-gray-400">{selectedMember.phone || selectedMember.email}</span>
                     </div>
                   </div>
                 ) : (
                   <div className="flex items-center gap-3 rounded-lg border border-border-dark/60 bg-background-dark/60 p-3">
                     <span className="text-sm text-gray-400">회원을 검색해주세요</span>
                   </div>
                 )}
              </div>


            </div>

             {/* 이용권 선택 */}
             <div className="space-y-4">
               <h4 className="text-lg font-semibold text-text-light">이용권 선택</h4>
               {ticketsLoading ? (
                 <div className="text-center py-8 text-gray-400">
                   이용권 목록을 불러오는 중...
                 </div>
               ) : ptTickets.length === 0 ? (
                 <div className="text-center py-8 text-gray-400">
                   등록된 PT 이용권이 없습니다.
                 </div>
               ) : (
                  <div className="space-y-3">
                    {ptTickets.map((ticket) => (
                      <label
                        key={ticket.ptId}
                        className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-150 ${
                          selectedTicket === ticket.ptId
                            ? "border-primary bg-primary/20"
                            : "border-border-dark/60 hover:border-primary/50"
                        }`}
                        onClick={() => handleTicketChange(ticket)}
                      >
                        <input
                          type="radio"
                          name="pt-ticket"
                          className="form-radio text-primary bg-background-dark/60 border-border-dark/60 focus:ring-primary"
                          checked={selectedTicket === ticket.ptId}
                          readOnly
                        />
                        
                        {/* PT 이용권 이미지 */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <S3Image
                            s3Key={ticket.ptPicUrl}
                            alt={ticket.ptName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 flex justify-between items-center">
                          <div>
                            <span className="font-medium text-text-light block">{ticket.ptName}</span>
                            <span className="text-sm text-gray-400">{ticket.ptCount}회 / {ticket.ptDurationDays}일</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-primary">
                              ₩{(ticket.ptPrice - ticket.ptSalePrice).toLocaleString()}
                            </div>
                            {ticket.ptSalePrice > 0 && (
                              <div className="text-sm text-gray-400 line-through">
                                ₩{ticket.ptPrice.toLocaleString()}
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
                 <label className="block text-sm font-medium text-text-light">이용권 시작일</label>
                 <div className="relative">
                   <input
                     type="date"
                     id="start-date"
                     value={startDate}
                     onChange={(e) => handleStartDateChange(e.target.value)}
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
                 <label className="block text-sm font-medium text-text-light">이용권 만료일</label>
                 <div className="relative">
                   <input
                     type="date"
                     id="end-date"
                     value={endDate}
                     onChange={(e) => setEndDate(e.target.value)}
                     min={startDate}
                     className="w-full rounded-lg border border-border-dark/60 bg-background-dark/60 px-4 py-3 pr-12 text-base text-text-light focus:border-primary focus:ring-primary cursor-pointer"
                   />
                   <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" onClick={() => document.getElementById('end-date').showPicker()}>
                     <span className="material-symbols-outlined text-primary text-xl">
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
                <span className="text-3xl font-bold text-primary">{totalPrice}</span>
              </div>
              <button 
                onClick={handleSellPtPass}
                disabled={loading || !selectedMember || !selectedTicket || !startDate || !endDate}
                className="w-full flex h-14 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-base font-bold text-white hover:bg-primary/90 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {loading ? "처리 중..." : "이용권 추가하기"}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
