import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getViewUrl } from '../lib/api';

// S3 이미지 컴포넌트
function S3Image({ s3Key, alt, className, ...props }) {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    console.log('🖼️ [S3Image] s3Key:', s3Key);
    if (!s3Key) {
      console.log('🖼️ [S3Image] s3Key가 없음, 기본 아이콘 표시');
      setError(true);
      return;
    }

    const fetchImageUrl = async () => {
      try {
        console.log('🖼️ [S3Image] getViewUrl 호출:', s3Key);
        const url = await getViewUrl(s3Key);
        console.log('🖼️ [S3Image] 받은 URL:', url);
        setImageUrl(url);
        setError(false);
      } catch (err) {
        console.error("🖼️ [S3Image] Failed to fetch image URL:", err);
        setError(true);
      }
    };

    fetchImageUrl();
  }, [s3Key]);

  if (error || !imageUrl) {
    return (
      <div className={`bg-gray-700 flex items-center justify-center ${className}`} {...props}>
        <span className="material-symbols-outlined text-gray-400 text-2xl">fitness_center</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt || "PT 이용권 이미지"}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}

export default function MyPTPasses() {
  const { user, token } = useAuthStore();
  const [ptPasses, setPtPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // PT 이용권 데이터 가져오기
  useEffect(() => {
    const fetchPtPasses = async () => {
      if (!token) return;

      try {
        const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || '';
        console.log('🔍 [MyPTPasses] API 호출:', `${SERVER_ORIGIN}/api/my/pt-passes`);
        
        const response = await fetch(`${SERVER_ORIGIN}/api/my/pt-passes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('🔍 [MyPTPasses] API 응답 상태:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('🔍 [MyPTPasses] API 에러 응답:', errorText);
          throw new Error(`PT 이용권 정보를 불러오는데 실패했습니다. (${response.status})`);
        }

        const data = await response.json();
        console.log('🔍 [MyPTPasses] API 응답 데이터:', data);
        console.log('🔍 [MyPTPasses] 첫 번째 PT 데이터:', data[0]);
        setPtPasses(data);
      } catch (err) {
        console.error('PT 이용권 조회 에러:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPtPasses();
  }, [token]);

  // 상태별 PT 이용권 분류
  const activePtPasses = ptPasses.filter(pt => pt.status === true && pt.remainingCount > 0 && 
    (!pt.endDate || pt.endDate > new Date().toISOString().split('T')[0]));
  const inactivePtPasses = ptPasses.filter(pt => 
    !pt.status || pt.remainingCount <= 0 || 
    (pt.endDate && pt.endDate <= new Date().toISOString().split('T')[0])
  );

  // 상태에 따른 배지 스타일
  const getStatusBadge = (uiStatus) => {
    switch (uiStatus) {
      case '사용 중':
        return 'inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary';
      case '횟수 소진':
        return 'inline-flex items-center rounded-full bg-gray-700 px-3 py-1 text-sm font-medium text-gray-300';
      case '기간 만료':
        return 'inline-flex items-center rounded-full bg-red-900/80 px-3 py-1 text-sm font-medium text-red-300';
      case '취소됨':
        return 'inline-flex items-center rounded-full bg-red-900/80 px-3 py-1 text-sm font-medium text-red-300';
      default:
        return 'inline-flex items-center rounded-full bg-gray-700 px-3 py-1 text-sm font-medium text-gray-300';
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '미정';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // D-day 계산
  const calculateDDay = (endDate) => {
    if (!endDate) return '';
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `(D-${diffDays})` : '(만료)';
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center text-white">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-bold tracking-tight text-white">내 PT 이용권</h2>
          <Link
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-lg font-bold text-background-dark transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark"
            to="/market"
          >
            구매하러 가기
          </Link>
        </div>
      </div>
      <div className="space-y-12">
        <div>
          <h3 className="mb-4 text-xl font-bold text-white">사용 중인 이용권</h3>
          {activePtPasses.length > 0 ? (
             activePtPasses.map((ptPass) => (
               <div key={ptPass.ptRecordId} className="overflow-hidden rounded-lg border border-primary/50 bg-primary/10 shadow-sm dark:bg-primary/20 mb-6">
                 <div className="p-6">{console.log(JSON.stringify(ptPass, null, 2))}
                   <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                     <div className="mb-4 w-full md:mb-0 md:w-1/3">
                       <div className="aspect-square w-full rounded-lg overflow-hidden">
                         <S3Image
                           s3Key={ptPass.ptPicUrl}
                           alt={ptPass.ptName}
                           className="w-full h-full object-cover"
                         />
                       </div>
                     </div>
                     <div className="flex-grow md:w-2/3">
                       <div className="flex flex-col">
                         <div className="flex items-center justify-between">
                           <p className="mb-2 text-2xl font-bold text-white">{ptPass.ptName}</p>
                           <span className={getStatusBadge(ptPass.uiStatus)}>
                             {ptPass.uiStatus}
                           </span>
                         </div>
                         <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                           <div className="flex items-center gap-2">
                             <p className="text-lg text-gray-300">총 횟수: <span className="font-bold text-white">{ptPass.ptTotalCount}회</span></p>
                           </div>
                           <div className="flex items-center gap-2">
                             <p className="text-lg text-gray-300">남은 횟수: <span className="font-bold text-white">{ptPass.remainingCount}회</span></p>
                           </div>
                           <div className="flex items-center gap-2">
                             <p className="text-lg text-gray-300">시작일: <span className="font-bold text-white">{formatDate(ptPass.startDate)}</span></p>
                           </div>
                           <div className="flex items-center gap-2">
                             <p className="text-lg text-gray-300">만료일: <span className="font-bold text-white">{formatDate(ptPass.endDate)} {calculateDDay(ptPass.endDate)}</span></p>
                            </div>
                            {ptPass.trainerName && (
                             <div className="flex items-center gap-2 sm:col-span-2">
                               <p className="text-lg text-gray-300">담당 트레이너: <span className="font-bold text-white">{ptPass.trainerName}</span></p>
                             </div>
                           )}
                         </div>
                                             <div className="mt-4 border-t border-primary/30 pt-4 text-right">
                           <div className="space-y-1 text-sm text-gray-400">
                             <p>정가: <span className="text-gray-400 line-through">₩{ptPass.price?.toLocaleString()}</span></p>
                             <p>할인: <span className="text-primary">-₩{ptPass.salePrice?.toLocaleString()}</span></p>
                           </div>
                           <p className="mt-1 text-lg font-bold text-white">구매 가격: <span className="text-primary">₩{ptPass.finalPrice?.toLocaleString()}</span></p>
                         </div>
                       </div>
                     </div>
                   </div>
                  </div>
                </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-lg">사용 중인 PT 이용권이 없습니다.</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-xl font-bold text-white">만료된 이용권</h3>
          <div className="space-y-6">
            {inactivePtPasses.length > 0 ? (
             inactivePtPasses.map((ptPass) => (
               <div key={ptPass.ptRecordId} className="overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-sm opacity-60">
                 <div className="p-6">
                   <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                     <div className="mb-4 w-full md:mb-0 md:w-1/3">
                       <div className="aspect-square w-full rounded-lg overflow-hidden">
                         <S3Image
                           s3Key={ptPass.ptPicUrl}
                           alt={ptPass.ptName}
                           className="w-full h-full object-cover"
                         />
                       </div>
                     </div>
                     <div className="flex-grow md:w-2/3">
                       <div className="flex flex-col">
                         <div className="flex items-center justify-between">
                           <p className="mb-2 text-2xl font-bold text-white">{ptPass.ptName}</p>
                           <span className={getStatusBadge(ptPass.uiStatus)}>
                             {ptPass.uiStatus}
                           </span>
                         </div>
                         <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                           <div className="flex items-center gap-2">
                             <p className="text-lg text-gray-400">총 횟수: <span className="font-bold">{ptPass.ptTotalCount}회</span></p>
                           </div>
                           <div className="flex items-center gap-2">
                             <p className="text-lg text-gray-400">남은 횟수: <span className="font-bold">{ptPass.remainingCount}회</span></p>
                           </div>
                           <div className="flex items-center gap-2">
                             <p className="text-lg text-gray-400">시작일: <span className="font-bold">{formatDate(ptPass.startDate)}</span></p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-lg text-gray-400">만료일: <span className="font-bold">{formatDate(ptPass.endDate)} {calculateDDay(ptPass.endDate)}</span></p>
                            </div>
                            {ptPass.trainerName && (
                              <div className="flex items-center gap-2 sm:col-span-2">
                                <p className="text-lg text-gray-400">담당 트레이너: <span className="font-bold">{ptPass.trainerName}</span></p>
                              </div>
                            )}
                          </div>
                         <div className="mt-4 border-t border-white/20 pt-4 text-right">
                           <p className="text-lg font-bold text-white">구매 가격: <span className="text-gray-400">₩{ptPass.ptPrice?.toLocaleString()}</span></p>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-lg">만료된 PT 이용권이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
