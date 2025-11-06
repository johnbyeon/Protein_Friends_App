import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiJson } from '../lib/api'

export default function MyCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true)
        const response = await apiJson('/my/coupons')
        if (!response.ok) {
          throw new Error(response.data?.message || '쿠폰 데이터를 불러오는데 실패했습니다.')
        }
        setCoupons(response.data)
      } catch (err) {
        console.error('쿠폰 데이터를 불러오는데 실패했습니다:', err)
        setError('쿠폰 데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchCoupons()
  }, [])

  // 활성 쿠폰과 만료된 쿠폰 분리
  const activeCoupons = (coupons || []).filter(coupon => 
    coupon.status === 'ACTIVE' || coupon.status === 'UPCOMING'
  )
  const expiredCoupons = (coupons || []).filter(coupon => 
    coupon.status === 'EXPIRED' || coupon.status === 'USED'
  )

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/ /g, '')
  }

  // 금액 포맷팅 함수
  const formatAmount = (amount) => {
    if (!amount) return '0원'
    return `${amount.toLocaleString()}원`
  }

  if (loading) {
    return (
      <main className="bg-background-dark text-text-light min-h-screen">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-400">쿠폰 데이터를 불러오는 중...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="bg-background-dark text-text-light min-h-screen">
        <div className="mx-auto max-w-4xl px-6 py-16">
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
    )
  }

   return (
      <main className="bg-background-dark text-text-light min-h-screen">
        <div className="mx-auto max-w-4xl px-6 py-16">
          
          {/* 헤더 */}
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-4xl font-extrabold tracking-tight text-primary">
              내 할인권
            </h2>
            <button className="rounded-lg bg-[var(--color-primary)] px-6 py-3 text-lg font-bold text-black shadow-[0_0_20px_var(--color-primary)] transition-all hover:scale-105">
              할인권 받기
            </button>
          </div>

          <div className="space-y-14">
            {/* 보유한 할인권 */}
            <section>
              <h3 className="mb-6 text-xl font-bold text-primary/90">
                보유한 할인권
              </h3>
              <div className="space-y-6">
                {activeCoupons.map(coupon => (
                  <div
                    key={coupon.recDisId}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-xl border border-primary/40 bg-surface-dark/60 shadow-[0_0_25px_-5px_var(--color-primary)] p-6 transition-all hover:shadow-[0_0_40px_-5px_var(--color-primary)]"
                  >
                    <img
                      src={coupon.thumbnailUrl}
                      alt={coupon.title}
                      className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">{coupon.code}</p>
                      <p className="text-2xl font-bold text-text-light mt-1">{coupon.title}</p>
                      <p className="text-gray-400 mt-2">
                        사용기간: <span className="text-white">{formatDate(coupon.startAt)}</span> ~{' '}
                        <span className="text-white">{formatDate(coupon.endAt)}</span> ({coupon.dday})
                      </p>
                      <p className="text-gray-400">
                        최소 금액: <span className="text-white">{formatAmount(coupon.minThreshold)}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold text-primary">
                        {coupon.badge}
                      </span>
                      <p className="text-3xl font-bold text-primary mt-2">
                        {coupon.displayValue}
                      </p>
                    </div>
                  </div>
                ))}
                {activeCoupons.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    보유한 할인권이 없습니다.
                  </div>
                )}
              </div>
            </section>

            {/* 만료된 할인권 */}
            <section>
              <h3 className="mb-6 text-xl font-bold text-gray-400">
                만료된 할인권
              </h3>
              <div className="space-y-6">
                {expiredCoupons.map(coupon => (
                  <div
                    key={coupon.recDisId}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-xl border border-border-dark bg-surface-dark/40 p-6 opacity-60"
                  >
                    <img
                      src={coupon.thumbnailUrl}
                      alt={coupon.title}
                      className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">{coupon.code}</p>
                      <p className="text-2xl font-bold text-gray-400 mt-1">{coupon.title}</p>
                      <p className="text-gray-500 mt-2">
                        사용기간: <span>{formatDate(coupon.startAt)}</span> ~{' '}
                        <span>{formatDate(coupon.endAt)}</span>
                      </p>
                      <p className="text-gray-500">
                        최소 금액: <span>{formatAmount(coupon.minThreshold)}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block rounded-full bg-gray-600/20 px-3 py-1 text-sm font-semibold text-gray-400">
                        {coupon.badge}
                      </span>
                      <p className="text-3xl font-bold text-gray-500 mt-2">
                        {coupon.displayValue}
                      </p>
                    </div>
                  </div>
                ))}
                {expiredCoupons.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    만료된 할인권이 없습니다.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
  </main>
  )
}
