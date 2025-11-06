import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getViewUrl, getMembershipImageUrl } from '../lib/api';

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
        console.log('🖼️ [S3Image] getMembershipImageUrl 호출:', s3Key);
        const url = await getMembershipImageUrl(s3Key);
        console.log('🖼️ [S3Image] 받은 URL:', url);
        setImageUrl(url);
        setError(false);
      } catch (err) {
        console.error("🖼️ [S3Image] Failed to fetch image URL:", err);
        // 임시로 로컬 기본 이미지 사용
        setImageUrl('/api/placeholder-membership.jpg');
        setError(false);
      }
    };

    fetchImageUrl();
  }, [s3Key]);

  if (error || !imageUrl) {
    return (
      <div className={`bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center ${className}`} {...props}>
        <div className="text-center text-white p-4">
          <span className="material-symbols-outlined text-6xl mb-2">card_membership</span>
          <p className="text-lg font-bold">프리미엄</p>
          <p className="text-sm opacity-90">회원권</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt || "회원권 이미지"}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}

export default function MyMemberships() {
  const { user, token } = useAuthStore();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 회원권 데이터 가져오기
  useEffect(() => {
    const fetchMemberships = async () => {
      if (!token) return;

      try {
        const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || '';
        console.log('🔍 [MyMemberships] API 호출:', `${SERVER_ORIGIN}/api/memberships/user`);
        
        const response = await fetch(`${SERVER_ORIGIN}/api/my/memberships`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('🔍 [MyMemberships] API 응답 상태:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('🔍 [MyMemberships] API 에러 응답:', errorText);
          throw new Error(`회원권 정보를 불러오는데 실패했습니다. (${response.status})`);
        }

        const data = await response.json();
        console.log('🔍 [MyMemberships] API 응답 데이터:', data);
        setMemberships(data);
      } catch (err) {
        console.error('회원권 조회 에러:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, [token]);

  // 상태별 회원권 분류
  const activeMemberships = memberships.filter(m => m.status === 'ACTIVE');
  const inactiveMemberships = memberships.filter(m => 
    ['EXPIRED', 'PAUSED', 'CANCELED'].includes(m.status)
  );

  // 상태에 따른 배지 스타일
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary';
      case 'EXPIRED':
        return 'inline-flex items-center rounded-full bg-gray-700 px-3 py-1 text-sm font-medium text-gray-300';
      case 'PAUSED':
        return 'inline-flex items-center rounded-full bg-yellow-900/80 px-3 py-1 text-sm font-medium text-yellow-300';
      case 'CANCELED':
        return 'inline-flex items-center rounded-full bg-red-900/80 px-3 py-1 text-sm font-medium text-red-300';
      default:
        return 'inline-flex items-center rounded-full bg-gray-700 px-3 py-1 text-sm font-medium text-gray-300';
    }
  };

  // 상태명 한글 변환
  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE': return '사용 중';
      case 'EXPIRED': return '만료';
      case 'PAUSED': return '정지';
      case 'CANCELED': return '취소';
      default: return status;
    }
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
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-4xl font-bold tracking-tight text-white">내 기간제 회원권</h2>
        <Link
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-background-dark transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark"
          to="/memberships"
        >
          구매하러 가기
        </Link>
      </div>
      <div className="space-y-12">
        <div>
          <h3 className="mb-4 text-xl font-bold text-white">내 회원권 정보</h3>
          {activeMemberships.length > 0 ? (
            activeMemberships.map((membership) => (
              <div key={membership.id || membership.membershipNumber || Math.random()} className="overflow-hidden rounded-lg border border-primary/50 bg-primary/10 shadow-sm dark:bg-primary/20">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                    <div className="mb-4 w-full md:mb-0 md:w-1/3">
                      <div className="aspect-square w-full rounded-lg overflow-hidden">
                        <S3Image
                          s3Key={membership.imageUrl}
                          alt={membership.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-grow md:w-2/3">
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <p className="mb-2 text-2xl font-bold text-white">{membership.name}</p>
                          <span className={getStatusBadge(membership.status)}>
                            {getStatusText(membership.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                           <div className="flex items-center gap-2">
                             <p className="text-lg text-gray-300">회원권 번호: <span className="font-bold text-white">{membership.code}</span></p>
                           </div>
                           <div className="flex items-center gap-2">
                             <p className="text-lg text-gray-300">구매일: <span className="font-bold text-white">{new Date(membership.buyDate).toLocaleDateString('ko-KR')}</span></p>
                           </div>
                          <div className="flex items-center gap-2">
                            <p className="text-lg text-gray-300">시작일: <span className="font-bold text-white">{new Date(membership.startDate).toLocaleDateString('ko-KR')}</span></p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-lg text-gray-300">종료일: <span className="font-bold text-white">{new Date(membership.endDate).toLocaleDateString('ko-KR')}</span></p>
                          </div>
                           <div className="col-span-1 flex items-center gap-2 sm:col-span-2">
                             <p className="text-lg text-gray-300">정지 가능 횟수: <span className="font-bold text-white">({3 - membership.stopUsed}/3)</span></p>
                           </div>
                        </div>
                         <div className="mt-4 border-t border-primary/30 pt-4 text-right">
                           <div className="space-y-1 text-sm text-gray-400">
                             <p>정가: <span className="text-gray-400 line-through">₩{membership.price?.toLocaleString()}</span></p>
                             <p>할인: <span className="text-primary">-₩{membership.discount?.toLocaleString()}</span></p>
                           </div>
                           <p className="mt-1 text-lg font-bold text-white">구매 가격: <span className="text-primary">₩{membership.finalPrice?.toLocaleString()}</span></p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-lg">사용 중인 회원권이 없습니다.</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-xl font-bold text-white">만료/정지/취소된 회원권</h3>
          <div className="space-y-6">
            {inactiveMemberships.length > 0 ? (
              inactiveMemberships.map((membership) => (
                <div key={membership.id || membership.membershipNumber || Math.random()} className="overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-sm opacity-60">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:gap-6">
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <p className="mb-2 text-2xl font-bold text-white">{membership.name}</p>
                          <span className={getStatusBadge(membership.status)}>
                            {getStatusText(membership.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
                           <div className="flex items-center gap-2">
                             <p className="text-lg text-gray-400">회원권 번호: <span className="font-bold text-white">{membership.code}</span></p>
                           </div>
                           <div className="flex items-center gap-2">
                             <p className="text-lg text-gray-400">구매일: <span className="font-bold text-white">{new Date(membership.buyDate).toLocaleDateString('ko-KR')}</span></p>
                           </div>
                          <div className="flex items-center gap-2">
                            <p className="text-lg text-gray-400">시작일: <span className="font-bold text-white">{new Date(membership.startDate).toLocaleDateString('ko-KR')}</span></p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-lg text-gray-400">종료일: <span className="font-bold text-white">{new Date(membership.endDate).toLocaleDateString('ko-KR')}</span></p>
                          </div>
                           <div className="col-span-1 flex items-center gap-2 sm:col-span-2">
                             <p className="text-lg text-gray-400">정지 가능 횟수: <span className="font-bold text-white">({3 - membership.stopUsed}/3)</span></p>
                           </div>
                        </div>
                      </div>
                      <div className="mt-4 w-full border-t border-white/20 pt-4 text-right md:mt-0 md:w-auto md:flex-shrink-0 md:border-0 md:pt-0">
                        <div className="space-y-1 text-sm text-gray-500">
                          <p>정가: <span className="text-gray-500 line-through">₩{membership.originalPrice?.toLocaleString()}</span></p>
                          <p>할인: <span>-₩{(membership.originalPrice - membership.price).toLocaleString()}</span></p>
                        </div>
                        <p className="mt-1 text-lg font-bold text-gray-400">구매 가격: <span>₩{membership.price?.toLocaleString()}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-lg">만료/정지/취소된 회원권이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
