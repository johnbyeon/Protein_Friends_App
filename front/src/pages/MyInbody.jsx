import { useState } from 'react';

export default function MyInbody() {
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');

  // 인바디 데이터 (실제로는 API에서 가져올 데이터)
  const inbodyData = [
    {
      date: '2024년 5월 11일',
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAf91iV5VThofm1FnsxpvNhi-J-eKGSaJW6WYIn9rxQrwhuG5s1myCHp3E3AKo6McFYwfhtDg3B2Znk_AwCz-3pY13C23SSzMovqu7jEARIYMBw8BkFohyZnrTszaxJsT47_DJ2nuc4N18b8pD3aeb1RCUo-jxDcoKIErhrvEIC_wNeBohPCcDQitRcEg176x9tKyGNLe7dIuQmsLMmTPSdrPiPVfEkv5UUywzCNjX1EiUa5TyOBfw4b6wxb6PdA7z-bE5REDGK2z3v',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC-pHAJh1YIDBCP_mAvWPZ-_lKV-TQCKUwdIxPpvVzPh_lACdD1_YXTym3TEQ2WaDZxkLC-8DAfMWB9O2-cjDYMQakMGxGdHGq31Km1XxixLjBt4cyUp1UKkc6n7xRV2nQRkRCFZpYhhKIITtAGVnJ8zixE2bStefJU-W2ams2_Ds1_O_XFadCuWDQF-LTc1-egWFb9Wktuq36BPcX20fxv2kLGijOObSddqZ1laQGvl8LzPCNxA82OSB0a060qZjw1RX4bVCv37IId'
      ]
    },
    {
      date: '2024년 4월 25일',
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAf91iV5VThofm1FnsxpvNhi-J-eKGSaJW6WYIn9rxQrwhuG5s1myCHp3E3AKo6McFYwfhtDg3B2Znk_AwCz-3pY13C23SSzMovqu7jEARIYMBw8BkFohyZnrTszaxJsT47_DJ2nuc4N18b8pD3aeb1RCUo-jxDcoKIErhrvEIC_wNeBohPCcDQitRcEg176x9tKyGNLe7dIuQmsLMmTPSdrPiPVfEkv5UUywzCNjX1EiUa5TyOBfw4b6wxb6PdA7z-bE5REDGK2z3v'
      ]
    },
    {
      date: '2024년 4월 10일',
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC-pHAJh1YIDBCP_mAvWPZ-_lKV-TQCKUwdIxPpvVzPh_lACdD1_YXTym3TEQ2WaDZxkLC-8DAfMWB9O2-cjDYMQakMGxGdHGq31Km1XxixLjBt4cyUp1UKkc6n7xRV2nQRkRCFZpYhhKIITtAGVnJ8zixE2bStefJU-W2ams2_Ds1_O_XFadCuWDQF-LTc1-egWFb9Wktuq36BPcX20fxv2kLGijOObSddqZ1laQGvl8LzPCNxA82OSB0a060qZjw1RX4bVCv37IId',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAf91iV5VThofm1FnsxpvNhi-J-eKGSaJW6WYIn9rxQrwhuG5s1myCHp3E3AKo6McFYwfhtDg3B2Znk_AwCz-3pY13C23SSzMovqu7jEARIYMBw8BkFohyZnrTszaxJsT47_DJ2nuc4N18b8pD3aeb1RCUo-jxDcoKIErhrvEIC_wNeBohPCcDQitRcEg176x9tKyGNLe7dIuQmsLMmTPSdrPiPVfEkv5UUywzCNjX1EiUa5TyOBfw4b6wxb6PdA7z-bE5REDGK2z3v',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC-pHAJh1YIDBCP_mAvWPZ-_lKV-TQCKUwdIxPpvVzPh_lACdD1_YXTym3TEQ2WaDZxkLC-8DAfMWB9O2-cjDYMQakMGxGdHGq31Km1XxixLjBt4cyUp1UKkc6n7xRV2nQRkRCFZpYhhKIITtAGVnJ8zixE2bStefJU-W2ams2_Ds1_O_XFadCuWDQF-LTc1-egWFb9Wktuq36BPcX20fxv2kLGijOObSddqZ1laQGvl8LzPCNxA82OSB0a060qZjw1RX4bVCv37IId'
      ]
    }
  ];

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

  return (
    <div className="flex min-h-screen w-full flex-col bg-background-dark">
      <main className="flex-1 bg-background-dark">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 헤더 */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">내 인바디 데이터</h1>
            <p className="text-gray-400 mt-2">박도윤 회원님 (#PT00125)</p>
          </div>

          {/* 인바디 데이터 섹션 */}
          <div className="space-y-10">
            {inbodyData.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className="text-xl font-semibold text-gray-300 mb-4 border-b border-primary pb-2">
                  {section.date}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {section.images.map((imageUrl, imageIndex) => (
                    <div
                      key={imageIndex}
                      className="cursor-pointer"
                      onClick={() => handleImageClick(imageUrl)}
                    >
                      <img
                        alt={`인바디 이미지 ${sectionIndex + 1}-${imageIndex + 1}`}
                        className="rounded-lg object-cover w-full h-auto aspect-[3/4] transition-transform duration-300 hover:scale-105"
                        src={imageUrl}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
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

