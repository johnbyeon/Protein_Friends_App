import { useState, useEffect } from 'react'
import { useBranchStore } from '../../stores/branchStore'
import { post } from '../../lib/api'

const BranchDetail = () => {
  const {
    branches,
    loading: branchesLoading,
    error,
    fetchBranches
  } = useBranchStore()

    const [selectedBranch, setSelectedBranch] = useState(null)
    const [showReviewModal, setShowReviewModal] = useState(false)
   const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' })

  // 지점 목록 가져오기 (Zustand store 사용)
  useEffect(() => {
    console.log('🔍 [BranchDetail] 컴포넌트 마운트, 지점 데이터 fetch 시작')
    fetchBranches()
  }, [fetchBranches])

  // 지점 데이터 변경 감지
  useEffect(() => {
    console.log('🔍 [BranchDetail] branches 상태:', {
      branches,
      branchesCount: branches?.length || 0,
      loading: branchesLoading,
      error
    })

    // 각 branch의 gId 확인
    if (branches && branches.length > 0) {
      console.log('🔍 [BranchDetail] 첫 번째 branch 전체 데이터:', branches[0])
      console.log('🔍 [BranchDetail] 첫 번째 station 데이터:', branches[0]?.stations?.[0])
    }
  }, [branches, branchesLoading, error])

   // 리뷰 작성 모달 열기
   const openReviewModal = (branch) => {
     setSelectedBranch(branch)
     setShowReviewModal(true)
     setReviewForm({ rating: 5, reviewText: '' })
   }



    // 리뷰 제출
    const submitReview = async () => {
      if (!selectedBranch || !reviewForm.reviewText.trim()) {
        alert('리뷰 내용을 입력해주세요.')
        return
      }

      if (reviewForm.reviewText.trim().length < 10) {
        alert('리뷰는 최소 10자 이상 입력해주세요.')
        return
      }

      try {
         await post(`/api/gyms/${selectedBranch.gId}/reviews`, {
          gRating: reviewForm.rating,
          gReview: reviewForm.reviewText.trim()
        })
        alert('리뷰가 성공적으로 등록되었습니다!')
        setShowReviewModal(false)
        setSelectedBranch(null)
        setReviewForm({ rating: 5, reviewText: '' })
      } catch (error) {
        console.error('리뷰 등록 중 오류:', error)
        alert('리뷰 등록에 실패했습니다. 다시 시도해주세요.')
      }
    }

    const closeReviewModal = () => {
      setShowReviewModal(false)
      setSelectedBranch(null)
    }

  // 지하철 노선 색상 매핑
  const getLineColor = (line) => {
    const colors = {
      '1': 'bg-blue-500',
      '2': 'bg-green-500',
      '3': 'bg-orange-500',
      '4': 'bg-cyan-500',
      '5': 'bg-purple-500',
      '6': 'bg-amber-600',
      '7': 'bg-olive-500',
      '8': 'bg-pink-500',
      '9': 'bg-gold-500',
      'A': 'bg-cyan-500', // 공항철도
      'K': 'bg-blue-700', // 경의중앙선
      'S': 'bg-yellow-500', // 신분당선
    }
    return colors[line] || 'bg-gray-500'
  }

  return (
    <div className="flex min-h-screen bg-background-dark">
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-10">
            <h1 className="text-4xl font-bold text-white">피트니스 센터 지점 정보</h1>
          </header>

          <div className="space-y-6">
            {branches && branches.length > 0 ? (
              branches.map((branch) => (
                 <div
                   key={branch.gId}
                   className="bg-surface rounded-lg border border-primary/50 flex overflow-hidden cursor-pointer hover:border-primary transition-colors"
                   onClick={() => openReviewModal(branch)}
                 >
                {/* 지점 이미지 */}
                <img
                   alt={`${branch.gName} 외관`}
                  className="w-1/3 object-cover"
                   src={branch.gImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23111827"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%233DFA2F"%3ENo Image%3C/text%3E%3C/svg%3E'}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23111827"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%233DFA2F"%3ENo Image%3C/text%3E%3C/svg%3E'
                  }}
                />

                {/* 지점 정보 */}
                <div className="w-2/3 p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{branch.gName}</h2>
                    <p className="text-white/70 mb-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      {branch.gAddress}
                    </p>
                    <p className="text-white/70 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">call</span>
                      {branch.gTel}
                    </p>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-white/80">
                      {/* 이용 시간 */}
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-lg mt-0.5">schedule</span>
                        <div>
                          <h3 className="font-semibold text-white/90">이용 시간</h3>
                           <p className="whitespace-pre-line">{branch.gWorkoutDuration}</p>
                        </div>
                      </div>

                      {/* 주차 안내 */}
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-lg mt-0.5">local_parking</span>
                        <div>
                          <h3 className="font-semibold text-white/90">주차 안내</h3>
                           <p>{branch.gParking}</p>
                        </div>
                      </div>

                      {/* 주변 역 정보 */}
                      {branch.stations && branch.stations.length > 0 && (
                        <div className="flex items-start gap-2 col-span-2">
                          <span className="material-symbols-outlined text-lg mt-0.5">train</span>
                          <div>
                            <h3 className="font-semibold text-white/90">주변 역 정보</h3>
                            <div className="flex items-center gap-4 mt-1 flex-wrap">
                              {branch.stations.map((station) => (
                                <div key={`${station.stationName}-${station.stationLine}`} className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full ${getLineColor(
                                      station.stationLine
                                    )}`}
                                  >
                                    {station.stationLine}
                                  </span>
                                  <span className="font-medium">{station.stationName}</span>
                                  <span className="text-white/60">도보 {station.walkTime}분</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div key="empty-state" className="text-center text-white/70 py-8">
                {branchesLoading ? '지점 정보를 불러오는 중...' : error ? `에러: ${error}` : '등록된 지점이 없습니다.'}
              </div>
            )}
          </div>
        </div>
      </main>



      {/* 리뷰 작성 모달 */}
      {showReviewModal && selectedBranch && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeReviewModal()
            }
          }}
        >
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-md p-8 relative">
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white"
              onClick={closeReviewModal}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">
              {selectedBranch.gName} 리뷰 작성
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">별점</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className={`text-2xl ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-400'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

               <div>
                 <label className="block text-sm font-medium text-white/90 mb-2">리뷰 내용</label>
                 <textarea
                   value={reviewForm.reviewText}
                   onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
                   placeholder="이 지점에 대한 솔직한 리뷰를 작성해주세요. (최소 10자)"
                   rows={4}
                   className="w-full px-3 py-2 bg-background-dark border border-primary/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                 />
                 <div className="text-xs text-white/60 mt-1">
                   {reviewForm.reviewText.length}/10자 (최소 10자 이상)
                 </div>
               </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={closeReviewModal}
                  className="px-4 py-2 text-sm text-white/70 hover:text-white"
                >
                  취소
                </button>
                <button
                  onClick={submitReview}
                  className="px-4 py-2 bg-primary text-black font-semibold rounded-md hover:opacity-90"
                >
                  리뷰 등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BranchDetail
