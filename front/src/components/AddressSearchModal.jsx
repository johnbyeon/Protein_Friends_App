import { useState } from 'react'

/**
 * 도로명 주소 검색 모달
 * - 주소 검색 API 사용
 */
export default function AddressSearchModal({ isOpen, onClose, onSelect }) {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 특수문자 체크
  const checkSearchedWord = (text) => {
    if (text.length > 0) {
      // 특수문자 제거
      const expText = /[%=><]/
      if (expText.test(text)) {
        alert('특수문자를 입력할 수 없습니다.')
        return false
      }

      // SQL 예약어 체크
      const sqlArray = [
        'OR', 'SELECT', 'INSERT', 'DELETE', 'UPDATE', 'CREATE', 'DROP', 'EXEC',
        'UNION', 'FETCH', 'DECLARE', 'TRUNCATE'
      ]

      for (let i = 0; i < sqlArray.length; i++) {
        const regex = new RegExp(sqlArray[i], 'gi')
        if (regex.test(text)) {
          alert(`"${sqlArray[i]}"와(과) 같은 특정문자로 검색할 수 없습니다.`)
          return false
        }
      }
    }
    return true
  }

  // 주소 검색
  const searchAddress = async () => {
    if (!checkSearchedWord(keyword)) {
      return
    }

    if (!keyword.trim()) {
      alert('검색어를 입력하세요.')
      return
    }

    setLoading(true)
    setMessage('검색 중...')

    try {
      // JSONP 방식으로 API 호출
      const script = document.createElement('script')
      const callbackName = 'jusoCallback_' + Date.now()

      window[callbackName] = (data) => {
        if (data.results.common.errorCode !== '0') {
          setMessage('검색 실패: ' + data.results.common.errorMessage)
          setResults([])
        } else {
          const jusoList = data.results.juso || []
          setResults(jusoList)
          setMessage(jusoList.length > 0 ? `${jusoList.length}개의 주소를 찾았습니다.` : '검색 결과가 없습니다.')
        }
        setLoading(false)
        document.body.removeChild(script)
        delete window[callbackName]
      }

      const params = new URLSearchParams({
        confmKey: import.meta.env.VITE_JUSO_API_KEY,
        currentPage: '1',
        countPerPage: '10',
        keyword: keyword,
        resultType: 'json',
        callback: callbackName
      })

      script.src = `https://business.juso.go.kr/addrlink/addrLinkApiJsonp.do?${params.toString()}`
      document.body.appendChild(script)

      // 타임아웃 설정
      setTimeout(() => {
        if (loading) {
          setLoading(false)
          setMessage('검색 시간 초과')
          if (document.body.contains(script)) {
            document.body.removeChild(script)
          }
          delete window[callbackName]
        }
      }, 10000)

    } catch (err) {
      console.error('주소 검색 오류:', err)
      setMessage('주소 검색 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  // 주소 선택
  const handleSelectAddress = (address) => {
    onSelect(address.roadAddr) // 도로명 주소 전달
    onClose()
  }

  // Enter 키 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      searchAddress()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-surface-dark rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-primary/30" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary/30">
          <h2 className="text-xl font-bold text-primary">주소 검색</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-text-light transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 검색 영역 */}
        <div className="px-6 py-4 border-b border-primary/20">
          <div className="flex gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="도로명, 건물명, 지번 검색"
              className="flex-1 px-4 py-3 rounded-lg border border-primary/20 bg-background-dark text-text-light placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={searchAddress}
              disabled={loading}
              className="px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? '검색중...' : '검색'}
            </button>
          </div>
          {message && (
            <p className={`mt-3 text-sm ${message.includes('실패') || message.includes('오류') ? 'text-error' : 'text-gray-400'}`}>
              {message}
            </p>
          )}
        </div>

        {/* 검색 결과 */}
        <div className="px-6 py-4 max-h-[400px] overflow-y-auto">
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((address, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectAddress(address)}
                  className="p-4 bg-background-dark rounded-lg border border-primary/20 hover:border-primary hover:bg-primary/10 cursor-pointer transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl flex-shrink-0 mt-1">location_on</span>
                    <div className="flex-1">
                      <p className="text-text-light font-medium mb-1">{address.roadAddr}</p>
                      <p className="text-sm text-gray-400">{address.jibunAddr}</p>
                      {address.zipNo && (
                        <p className="text-xs text-primary mt-1">우편번호: {address.zipNo}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <span className="material-symbols-outlined text-5xl mb-3">search</span>
              <p>주소를 검색해주세요</p>
              <p className="text-sm mt-2">도로명, 건물명 또는 지번으로 검색 가능합니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

