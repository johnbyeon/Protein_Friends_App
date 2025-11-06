import { useState } from 'react'
import { Link } from 'react-router-dom'
import LeftSidebar from '../components/LeftSidebar'

export default function MyCoupons() {
  const [coupons] = useState([
    {
      id: '#000123',
      title: '신규 회원 PT 1회 50% 할인',
      type: 'PT',
      discount: '50%',
      startDate: '2024.06.01',
      endDate: '2024.08.31',
      daysLeft: 30,
      minAmount: '50,000원',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAf91iV5VThofm1FnsxpvNhi-J-eKGSaJW6WYIn9rxQrwhuG5s1myCHp3E3AKo6McFYwfhtDg3B2Znk_AwCz-3pY13C23SSzMovqu7jEARIYMBw8BkFohyZnrTszaxJsT47_DJ2nuc4N18b8pD3aeb1RCUo-jxDcoKIErhrvEIC_wNeBohPCcDQitRcEg176x9tKyGNLe7dIuQmsLMmTPSdrPiPVfEkv5UUywzCNjX1EiUa5TyOBfw4b6wxb6PdA7z-bE5REDGK2z3v',
      status: 'active'
    },
    {
      id: '#000124',
      title: '여름맞이 멤버십 1개월 2만원 할인',
      type: '멤버십',
      discount: '₩20,000',
      startDate: '2024.07.01',
      endDate: '2024.07.31',
      daysLeft: 1,
      minAmount: '100,000원',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-pHAJh1YIDBCP_mAvWPZ-_lKV-TQCKUwdIxPpvVzPh_lACdD1_YXTym3TEQ2WaDZxkLC-8DAfMWB9O2-cjDYMQakMGxGdHGq31Km1XxixLjBt4cyUp1UKkc6n7xRV2nQRkRCFZpYhhKIITtAGVnJ8zixE2bStefJU-W2ams2_Ds1_O_XFadCuWDQF-LTc1-egWFb9Wktuq36BPcX20fxv2kLGijOObSddqZ1laQGvl8LzPCNxA82OSB0a060qZjw1RX4bVCv37IId',
      status: 'active'
    }
  ])

   return (
    <div className="flex min-h-screen bg-background-dark">
      <LeftSidebar />
      <main className="flex-1 bg-background-dark text-text-light">
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
                {coupons.map(coupon => (
                  <div
                    key={coupon.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-xl border border-primary/40 bg-surface-dark/60 shadow-[0_0_25px_-5px_var(--color-primary)] p-6 transition-all hover:shadow-[0_0_40px_-5px_var(--color-primary)]"
                  >
                    <img
                      src={coupon.image}
                      alt={coupon.title}
                      className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">{coupon.id}</p>
                      <p className="text-2xl font-bold text-text-light mt-1">{coupon.title}</p>
                      <p className="text-gray-400 mt-2">
                        사용기간: <span className="text-white">{coupon.startDate}</span> ~{' '}
                        <span className="text-white">{coupon.endDate}</span> (D-{coupon.daysLeft})
                      </p>
                      <p className="text-gray-400">
                        최소 금액: <span className="text-white">{coupon.minAmount}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold text-primary">
                        {coupon.type}
                      </span>
                      <p className="text-3xl font-bold text-primary mt-2">
                        {coupon.discount}
                      </p>
                    </div>
                  </div>
                ))}
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
                    key={coupon.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-xl border border-border-dark bg-surface-dark/40 p-6 opacity-60"
                  >
                    <img
                      src={coupon.image}
                      alt={coupon.title}
                      className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">{coupon.id}</p>
                      <p className="text-2xl font-bold text-gray-400 mt-1">{coupon.title}</p>
                      <p className="text-gray-500 mt-2">
                        사용기간: <span>{coupon.startDate}</span> ~{' '}
                        <span>{coupon.endDate}</span>
                      </p>
                      <p className="text-gray-500">
                        최소 금액: <span>{coupon.minAmount}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block rounded-full bg-gray-600/20 px-3 py-1 text-sm font-semibold text-gray-400">
                        {coupon.type}
                      </span>
                      <p className="text-3xl font-bold text-gray-500 mt-2">
                        {coupon.discount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
