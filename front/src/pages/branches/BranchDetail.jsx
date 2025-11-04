import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useBranchStore } from '../../stores/branchStore'

const BranchDetail = () => {
  const { id } = useParams()
  const {
    branches,
    loading: branchesLoading,
    error,
    fetchBranches,
    fetchBranchTrainers
  } = useBranchStore()

  const [selectedBranch, setSelectedBranch] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalTrainers, setModalTrainers] = useState([])
  const [loading, setLoading] = useState(false)

  // 지점 목록 가져오기 (Zustand store 사용)
  useEffect(() => {
    console.log('🔍 [BranchDetail] 컴포넌트 마운트, 지점 데이터 fetch 시작')
    fetchBranches()
  }, [])

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

  // 트레이너 정보 모달 열기
  const openModal = async (branch) => {
    setSelectedBranch(branch)
    setShowModal(true)
    setLoading(true)

    try {
      const trainers = await fetchBranchTrainers(branch.gid)
      setModalTrainers(trainers)
    } catch (error) {
      console.error('트레이너 정보 조회 중 오류:', error)
      setModalTrainers([])
    } finally {
      setLoading(false)
    }
  }

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false)
    setSelectedBranch(null)
    setModalTrainers([])
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
                  key={branch.gid}
                  className="bg-surface rounded-lg border border-primary/50 flex overflow-hidden cursor-pointer hover:border-primary transition-colors"
                  onClick={() => openModal(branch)}
                >
                {/* 지점 이미지 */}
                <img
                  alt={`${branch.gname} 외관`}
                  className="w-1/3 object-cover"
                  src={branch.gimageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23111827"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%233DFA2F"%3ENo Image%3C/text%3E%3C/svg%3E'}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23111827"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%233DFA2F"%3ENo Image%3C/text%3E%3C/svg%3E'
                  }}
                />

                {/* 지점 정보 */}
                <div className="w-2/3 p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{branch.gname}</h2>
                    <p className="text-white/70 mb-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      {branch.gaddress}
                    </p>
                    <p className="text-white/70 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">call</span>
                      {branch.gtel}
                    </p>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-white/80">
                      {/* 이용 시간 */}
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-lg mt-0.5">schedule</span>
                        <div>
                          <h3 className="font-semibold text-white/90">이용 시간</h3>
                          <p className="whitespace-pre-line">{branch.gworkoutDuration}</p>
                        </div>
                      </div>

                      {/* 주차 안내 */}
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-lg mt-0.5">local_parking</span>
                        <div>
                          <h3 className="font-semibold text-white/90">주차 안내</h3>
                          <p>{branch.gparking}</p>
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

      {/* 트레이너 정보 모달 */}
      {showModal && selectedBranch && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal()
            }
          }}
        >
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative">
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white"
              onClick={closeModal}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="text-3xl font-bold text-white mb-6">
              {selectedBranch.gname} 트레이너 정보
            </h2>

            {loading ? (
              <div key="modal-loading" className="text-center text-white/70 py-8">로딩 중...</div>
            ) : modalTrainers.length > 0 ? (
              <div key="modal-trainers" className="space-y-6">
                {modalTrainers.map((trainer, index) => (
                  <div key={trainer.tid || index}>
                    <div className="flex items-start gap-6">
                      <img
                        alt={`${trainer.tname} 트레이너`}
                        className="w-32 h-32 rounded-full object-cover border-2 border-primary"
                        src={trainer.timageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Ccircle cx="75" cy="75" r="75" fill="%23111827"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%233DFA2F"%3ETrainer%3C/text%3E%3C/svg%3E'}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Ccircle cx="75" cy="75" r="75" fill="%23111827"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%233DFA2F"%3ETrainer%3C/text%3E%3C/svg%3E'
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{trainer.tname} 트레이너</h3>
                        <div className="mt-4 space-y-2 text-white/90">
                          <p>{trainer.tbio || '전문 트레이너입니다.'}</p>
                          {trainer.tcareer && <p>{trainer.tcareer}</p>}
                          {trainer.tspecialty && <p>전문 분야: {trainer.tspecialty}</p>}
                        </div>
                      </div>
                    </div>
                    {index < modalTrainers.length - 1 && (
                      <div className="border-t border-white/10 my-4"></div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div key="modal-empty" className="text-center text-white/70 py-8">
                등록된 트레이너가 없습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BranchDetail
