import { useState } from 'react';

export default function MyInfo() {
  const [formData, setFormData] = useState({
    name: 'Sophia Lee',
    phone: '+82 10-1234-5678',
    gender: '선택 안함',
    birthdate: '',
    branch: '강남점',
    height: '',
    weight: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (formData.name.trim() === '' || formData.phone.trim() === '') {
      alert('이름과 전화번호는 비울 수 없습니다.');
    } else {
      alert('저장하였습니다.');
      // TODO: API 호출하여 서버에 저장
    }
  };

  return (
    <div className="flex justify-center w-full min-h-screen py-8">
      <div className="w-full max-w-4xl px-4 md:px-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">내 정보 보기</h1>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          {/* 프로필 이미지 */}
          <div className="relative group">
            <div 
              className="w-32 h-32 rounded-full bg-cover bg-center"
              style={{
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAuVpmFKyITTn9WRXlvREqKe55X7UI0AYg-EHpFTgv1B3IV5IsDIfijEduF3xpVdKMJc3cGKVVUpCsJ5se6lRdwJFDZezhi-4yGvqXGyLnQUN-8o9uhazShvVUyt9Mh1bdtaIgVOjiYZW1BbScwQcsLjY4Nd8O9YcCvlo4yZtSMpJZkC2gn2COVFTtmqShh-h6JeJS5dkS1EXbijBUmeZjKxw23swN2apJInF8X8ukzgRWnG889Xt4vc0qYnPP-HRR43Psu470Jr6E")'
              }}
            />
            <button
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
            >
              <span className="text-white text-sm">변경</span>
            </button>
          </div>

          {/* 기본 정보 */}
          <div className="w-full md:w-auto flex-1 text-center md:text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label 
                  className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2" 
                  htmlFor="name"
                >
                  이름
                </label>
                <input
                  className="form-input relative block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark sm:text-sm transition-all duration-200"
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2" 
                  htmlFor="phone"
                >
                  전화번호
                </label>
                <input
                  className="form-input relative block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark sm:text-sm transition-all duration-200"
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
              <div className="w-8 h-8 flex items-center justify-center bg-primary/20 dark:bg-primary/30 rounded-full">
                <svg 
                  className="text-primary" 
                  fill="currentColor" 
                  height="18px" 
                  viewBox="0 0 256 256"
                  width="18px" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M224,128a96,96,0,1,1-21.95-61.09,8,8,0,1,1-12.33,10.18A80,80,0,1,0,207.6,136H128a8,8,0,0,1,0-16h88A8,8,0,0,1,224,128Z" />
                </svg>
              </div>
              <span className="text-sm text-black dark:text-white">소셜 계정 연결됨</span>
            </div>
            
            <div className="mt-4 text-center md:text-left">
              <button 
                className="text-primary text-sm font-medium hover:underline" 
                type="button"
              >
                비밀번호 변경하기
              </button>
            </div>
          </div>
        </div>

        {/* 추가 정보 탭 */}
        <div>
          <div className="border-b border-primary/30">
            <nav aria-label="Tabs" className="-mb-px flex space-x-8">
              <a 
                className="border-primary text-primary whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                href="#"
              >
                추가 정보
              </a>
            </nav>
          </div>
          
          <div className="pt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label 
                  className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2" 
                  htmlFor="gender"
                >
                  성별
                </label>
                <select
                  className="form-input relative block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-4 text-gray-900 dark:text-gray-100 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark sm:text-sm transition-all duration-200"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option>선택 안함</option>
                  <option>남성</option>
                  <option>여성</option>
                </select>
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2" 
                  htmlFor="birthdate"
                >
                  생년월일
                </label>
                <input
                  className="form-input relative block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark sm:text-sm transition-all duration-200"
                  id="birthdate"
                  name="birthdate"
                  placeholder="YYYY-MM-DD"
                  type="text"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2" 
                  htmlFor="branch"
                >
                  소속 지점
                </label>
                <input
                  className="block w-full rounded-lg border-primary/30 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  disabled
                  id="branch"
                  name="branch"
                  type="text"
                  value={formData.branch}
                />
              </div>
              
              <div></div>
              
              <div>
                <label 
                  className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2" 
                  htmlFor="height"
                >
                  키 (cm)
                </label>
                <input
                  className="form-input relative block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark sm:text-sm transition-all duration-200"
                  id="height"
                  name="height"
                  type="text"
                  value={formData.height}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2" 
                  htmlFor="weight"
                >
                  몸무게 (kg)
                </label>
                <input
                  className="form-input relative block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark sm:text-sm transition-all duration-200"
                  id="weight"
                  name="weight"
                  type="text"
                  value={formData.weight}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.95]"
                type="button"
                onClick={handleSave}
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'black'
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

