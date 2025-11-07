import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBranchStore } from '../../stores/branchStore';
import { useAuthStore } from '../../stores/authStore';
import { post, getViewUrl } from '../../lib/api';

// S3 이미지 컴포넌트 (트레이너용 - 403 에러 시 fallback)
const S3Image = ({ imageKey, alt, className, onError }) => {
  const [imageUrl, setImageUrl] = useState('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjMTExODI3Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzNERkEyRiI+TG9hZGluZy4uLjwvdGV4dD4KPC9zdmc+')
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true)
        setHasError(false)
        const url = await getViewUrl(imageKey)
        setImageUrl(url)
      } catch (error) {
        console.error('이미지 로드 실패 (403 Forbidden 가능성):', error)
        setHasError(true)
        // 403 에러 시 기본 이미지로 표시
        setImageUrl('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjMTExODI3Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzNERkEyRiI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==')
      } finally {
        setLoading(false)
      }
    }

    if (imageKey) {
      loadImage()
    }
  }, [imageKey])

  // 403 에러 시 이미지 대신 아이콘 표시
  if (hasError) {
    return (
      <div className={`${className} bg-gray-700 flex items-center justify-center`}>
        <span className="text-gray-400 text-4xl">👤</span>
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        console.error('이미지 로드 에러:', e.target.src)
        setHasError(true)
        if (onError) onError(e)
      }}
    />
  )
}

const BranchDetailPage = () => {
  const { gid } = useParams();
  const { fetchBranchDetail, fetchBranchReviews, fetchBranchTrainers } = useBranchStore();
  const { user } = useAuthStore();

  const [branch, setBranch] = useState(null);
  const [reviewData, setReviewData] = useState({ averageRating: null, totalCount: 0, reviews: [] });
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('🔍 [BranchDetailPage] 데이터 로드 시작 - gid:', gid);

        // 지점 상세 정보 로드
        const branchData = await fetchBranchDetail(gid);
        console.log('🔍 [BranchDetailPage] branchData:', branchData);
        console.log('🔍 [BranchDetailPage] branchData 키들:', branchData ? Object.keys(branchData) : 'null');
        setBranch(branchData);

        // 리뷰 목록 로드 (개별 에러 처리)
        try {
          const reviewsData = await fetchBranchReviews(gid);
          console.log('🔍 [BranchDetailPage] reviewsData:', reviewsData);
          // reviewsData가 객체 형태로 옴: { averageRating, totalCount, reviews }
          if (reviewsData && typeof reviewsData === 'object') {
            setReviewData({
              averageRating: reviewsData.averageRating || null,
              totalCount: reviewsData.totalCount || 0,
              reviews: Array.isArray(reviewsData.reviews) ? reviewsData.reviews : []
            });
          } else {
            setReviewData({ averageRating: null, totalCount: 0, reviews: [] });
          }
        } catch (err) {
          console.error('❌ [BranchDetailPage] 리뷰 로드 에러:', err);
          setReviewData({ averageRating: null, totalCount: 0, reviews: [] });
        }

        // 트레이너 목록 로드 (개별 에러 처리)
        try {
          const trainersData = await fetchBranchTrainers(gid);
          console.log('🔍 [BranchDetailPage] trainersData:', trainersData);
          setTrainers(trainersData);
        } catch (err) {
          console.error('❌ [BranchDetailPage] 트레이너 로드 에러:', err);
          setTrainers([]);
        }

      } catch (err) {
        console.error('❌ [BranchDetailPage] 데이터 로드 에러:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (gid) {
      loadData();
    }
  }, [gid, fetchBranchDetail, fetchBranchReviews, fetchBranchTrainers]);

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
      '신': 'bg-yellow-500', // 신분당선
    };
    return colors[line] || 'bg-gray-500';
  };

   // 리뷰 작성 모달 열기
   const openReviewModal = () => {
     // 백엔드에서 권한 체크했으므로 바로 모달 열기
     setReviewForm({ rating: 5, reviewText: '' });
     setShowReviewModal(true);
   };

   // 트레이너 모달 열기 (리스트 재조회)
   const openTrainerModal = async () => {
     try {
       const trainersData = await fetchBranchTrainers(gid);
       setTrainers(trainersData);
     } catch (err) {
       console.error('❌ 트레이너 목록 재조회 에러:', err);
       setTrainers([]);
     }
     setShowTrainerModal(true);
   };

  // 리뷰 제출
  const submitReview = async () => {
    if (!reviewForm.reviewText.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    if (reviewForm.reviewText.trim().length < 10) {
      alert('리뷰는 최소 10자 이상 입력해주세요.');
      return;
    }

    try {
      await post(`/api/gyms/${gid}/reviews`, {
        gRating: reviewForm.rating,
        gReview: reviewForm.reviewText.trim()
      });
      alert('리뷰가 성공적으로 등록되었습니다!');
      setShowReviewModal(false);
      // 리뷰 목록 새로고침
      const reviewsData = await fetchBranchReviews(gid);
      if (reviewsData && typeof reviewsData === 'object') {
        setReviewData({
          averageRating: reviewsData.averageRating || null,
          totalCount: reviewsData.totalCount || 0,
          reviews: Array.isArray(reviewsData.reviews) ? reviewsData.reviews : []
        });
      }
    } catch (error) {
      console.error('리뷰 등록 중 오류:', error);
      alert('리뷰 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background-dark text-white">
        <main className="flex-1 p-8">
          <div className="text-center">로딩 중...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background-dark text-white">
        <main className="flex-1 p-8">
          <div className="text-center text-red-500">오류: {error}</div>
        </main>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="flex min-h-screen bg-background-dark text-white">
        <main className="flex-1 p-8">
          <div className="text-center">지점을 찾을 수 없습니다.</div>
        </main>
      </div>
    );
  }

  const isMyBranch = user?.gId === parseInt(gid);

  return (
    <div className="flex min-h-screen bg-background-dark text-white">
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-10">
            <h1 className="text-4xl font-bold text-white">피트니스 센터 지점 정보</h1>
          </header>

          {/* 지점 상세 정보 */}
          <div className="bg-surface rounded-lg border border-primary/50 flex overflow-hidden mb-8">
            <img
              alt={`${branch.gName} 외관`}
              className="w-1/3 object-cover"
              src={branch.gImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23111827"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%233DFA2F"%3ENo Image%3C/text%3E%3C/svg%3E'}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23111827"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%233DFA2F"%3ENo Image%3C/text%3E%3C/svg%3E';
              }}
            />
            <div className="w-2/3 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-white mb-2">{branch.gName}</h2>
                  <div className="flex items-center gap-2 text-yellow-400">
                    <span className="material-symbols-outlined">star</span>
                    <span className="font-bold text-lg">
                      {reviewData.averageRating !== null && reviewData.averageRating !== undefined
                        ? reviewData.averageRating.toFixed(1)
                        : '0.0'
                      }
                    </span>
                    <span className="text-white/60 text-sm">({reviewData.totalCount}개 리뷰)</span>
                  </div>
                </div>
                <p className="text-white/70 mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  {branch.gAddress}
                </p>
                <p className="text-white/70 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">call</span>
                  {branch.gTel}
                </p>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-white/80">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-lg mt-0.5">schedule</span>
                    <div>
                      <h3 className="font-semibold text-white/90">이용 시간</h3>
                      <p>{branch.gWorkoutDuration || '정보 없음'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-lg mt-0.5">local_parking</span>
                    <div>
                      <h3 className="font-semibold text-white/90">주차 안내</h3>
                      <p>{branch.gParking || '정보 없음'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 col-span-2">
                    <span className="material-symbols-outlined text-lg mt-0.5">train</span>
                    <div>
                      <h3 className="font-semibold text-white/90">주변 역 정보</h3>
                      <div className="flex items-center gap-4 mt-1">
                        {branch.stations && branch.stations.length > 0 ? (
                          branch.stations.map((station, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full ${getLineColor(station.stationLine)}`}>
                                {station.stationLine}
                              </span>
                              <span className="font-medium">{station.stationName}</span>
                              <span className="text-white/60">도보 {station.walkTime}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-white/60">정보 없음</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                 {/* Actions */}
                 <div className="mt-4 flex gap-4">
                   <button
                     onClick={openTrainerModal}
                     className="px-4 py-2 text-sm bg-primary text-black font-semibold rounded-md hover:opacity-90"
                   >
                     트레이너 정보 보기
                   </button>
                   {user && branch.canWriteReview && (
                     <button
                       onClick={openReviewModal}
                       className="px-4 py-2 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-600"
                     >
                       리뷰 작성
                     </button>
                   )}
                 </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-surface rounded-lg border border-primary/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">리뷰</h2>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <span className="material-symbols-outlined">star</span>
                    <span className="text-2xl font-bold">
                      {reviewData.averageRating !== null && reviewData.averageRating !== undefined
                        ? reviewData.averageRating.toFixed(1)
                        : '0.0'
                      }
                    </span>
                  </div>
                  <p className="text-sm text-white/60 mt-1">총 {reviewData.totalCount}개 리뷰</p>
                </div>
              </div>
            </div>
            {reviewData.reviews.length > 0 ? (
              <div className="space-y-4">
                {reviewData.reviews.map((review, index) => (
                  <div key={review.id || index} className="border-b border-gray-700 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.gRating ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                          ))}
                        </div>
                        <p className="text-white/80 font-medium">{review.authorName || '익명'}</p>
                      </div>
                      {review.createdAt && (
                        <p className="text-white/50 text-sm">
                          {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      )}
                    </div>
                    <p className="text-white/90 leading-relaxed">{review.gReview}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/70 text-center py-8">아직 작성된 리뷰가 없습니다.</p>
            )}
          </div>
        </div>
      </main>

      {/* 트레이너 정보 모달 */}
      {showTrainerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative">
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white"
              onClick={() => setShowTrainerModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="text-3xl font-bold text-white mb-6">{branch.gName} 트레이너 정보</h2>
            <div className="space-y-6">
              {trainers.length > 0 ? (
                trainers.map((trainer) => {
                  // Jackson 설정이 없어서 응답이 카멜케이스와 소문자 모두 옴
                  const imageKey = trainer.timageUrl || trainer.tImageUrl
                  const name = trainer.tname || trainer.tName
                  const bio = trainer.tbio || trainer.tBio
                  const career = trainer.tcareer || trainer.tCareer
                  const specialty = trainer.tspecialty || trainer.tSpecialty

                  console.log('🔍 [Trainer] imageKey:', imageKey)

                  return (
                    <div key={trainer.tid || trainer.tId} className="flex items-start gap-6 border-b border-gray-700 pb-6 last:border-0">
                      {imageKey ? (
                        <S3Image
                          imageKey={imageKey}
                          alt={`${name} 트레이너`}
                          className="w-32 h-32 rounded-full object-cover border-2 border-primary flex-shrink-0"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjMTExODI3Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzNERkEyRiI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=='
                          }}
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-2 border-primary flex-shrink-0">
                          <span className="text-gray-400 text-4xl">👤</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">{name} 트레이너</h3>
                        {specialty && (
                          <p className="text-primary mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">fitness_center</span>
                            {specialty}
                          </p>
                        )}
                        <div className="mt-4 space-y-3">
                          {bio && (
                            <div>
                              <h4 className="text-sm font-semibold text-primary mb-1">자기소개</h4>
                              <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{bio}</p>
                            </div>
                          )}
                          {career && (
                            <div>
                              <h4 className="text-sm font-semibold text-primary mb-1">경력 및 수상이력</h4>
                              <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{career}</p>
                            </div>
                          )}
                          {!bio && !career && (
                            <p className="text-white/60 italic">트레이너 소개가 아직 등록되지 않았습니다.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-white/70">등록된 트레이너가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 리뷰 작성 모달 */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-md p-8 relative">
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white"
              onClick={() => setShowReviewModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">{branch.gName} 리뷰 작성</h2>

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
                  onClick={() => setShowReviewModal(false)}
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
  );
};

export default BranchDetailPage;