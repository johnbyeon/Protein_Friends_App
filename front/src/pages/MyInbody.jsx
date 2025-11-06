import { useState, useEffect } from 'react';
import { apiJson } from '../lib/api';

export default function MyInbody() {
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [inbodyData, setInbodyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInbodyData = async () => {
      try {
        setLoading(true);
        const response = await apiJson('/my/inbody');
        if (!response.ok) {
          throw new Error(response.data?.message || '인바디 데이터를 불러오는데 실패했습니다.');
        }
        setInbodyData(response.data);
      } catch (err) {
        console.error('인바디 데이터를 불러오는데 실패했습니다:', err);
        setError('인바디 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchInbodyData();
  }, []);

  const handleImageClick = (imageUrl) => {
    setModalImage(imageUrl);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // ESC 키로 모달 닫기
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background-dark">
        <main className="flex-1 bg-background-dark">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-400">인바디 데이터를 불러오는 중...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background-dark">
        <main className="flex-1 bg-background-dark">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-red-400">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-primary text-black rounded-lg hover:opacity-80"
              >
                다시 시도
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background-dark">
      <main className="flex-1 bg-background-dark">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 헤더 */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">내 인바디 데이터</h1>
            <p className="text-gray-400 mt-2">인바디 측정 기록</p>
          </div>

          {/* 인바디 데이터 섹션 */}
          <div className="space-y-10">
            {(inbodyData || []).map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className="text-xl font-semibold text-gray-300 mb-4 border-b border-primary pb-2">
                  {section.date}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {(section.images || []).map((image, imageIndex) => (
                    <div
                      key={imageIndex}
                      className="cursor-pointer"
                      onClick={() => handleImageClick(image.inbodyPicUrl)}
                    >
                      <img
                        alt={`인바디 이미지 ${sectionIndex + 1}-${imageIndex + 1}`}
                        className="rounded-lg object-cover w-full h-auto aspect-[3/4] transition-transform duration-300 hover:scale-105"
                        src={image.inbodyPicUrl}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {(!inbodyData || inbodyData.length === 0) && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-xl">인바디 데이터가 없습니다.</p>
                <p className="mt-2">트레이너에게 문의하여 인바디 측정을 진행해주세요.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 이미지 확대 모달 */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImage}
              alt="확대된 인바디 이미지"
              className="rounded-lg object-contain w-full h-full"
            />
            <button
              onClick={closeModal}
              className="absolute -top-4 -right-4 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-colors duration-200"
              aria-label="닫기"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

