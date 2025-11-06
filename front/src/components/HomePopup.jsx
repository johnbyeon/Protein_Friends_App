import { useState, useEffect } from 'react';

const HomePopup = ({ popups, onClose, onTodayClose }) => {
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);

  console.log('🔍 [HomePopup] popups prop:', popups);
  console.log('🔍 [HomePopup] popups length:', popups?.length);

  if (!popups || popups.length === 0) {
    console.log('🔍 [HomePopup] 팝업 데이터 없음 - 렌더링 안함');
    return null;
  }

  const currentPopup = popups[currentPopupIndex];
  const isMultiplePopups = popups.length > 1;

  console.log('🔍 [HomePopup] currentPopup:', currentPopup);
  console.log('🔍 [HomePopup] currentPopup keys:', currentPopup ? Object.keys(currentPopup) : 'null');

  const handleNext = () => {
    if (currentPopupIndex < popups.length - 1) {
      setCurrentPopupIndex(currentPopupIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentPopupIndex > 0) {
      setCurrentPopupIndex(currentPopupIndex - 1);
    }
  };

  const handleTodayClose = () => {
    onTodayClose();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentPopup.ptypeName || '공지사항'}
          </h3>
          <div className="flex items-center gap-2">
            {isMultiplePopups && (
              <span className="text-sm text-gray-500">
                {currentPopupIndex + 1} / {popups.length}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-gray-500">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {currentPopup.ptitle}
          </h2>
          
          {/* 이미지가 있는 경우 */}
          {currentPopup.pimageUrl && (
            <div className="mb-4">
              <img
                src={currentPopup.pimageUrl}
                alt={currentPopup.ptitle}
                className="w-full rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* 내용 */}
          <div 
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: currentPopup.pcontent }}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            {isMultiplePopups && (
              <>
                <button
                  onClick={handlePrev}
                  disabled={currentPopupIndex === 0}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  이전
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPopupIndex === popups.length - 1}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  다음
                </button>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleTodayClose}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              오늘 하루 보지 않기
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1 text-sm bg-primary text-black font-semibold rounded hover:opacity-90 transition-opacity"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePopup;