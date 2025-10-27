import { useState } from 'react'
import { Link } from 'react-router-dom'

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

  const [expiredCoupons] = useState([
    {
      id: '#000098',
      title: '프로틴바 1+1 증정',
      type: '마켓',
      discount: '1+1',
      startDate: '2024.05.01',
      endDate: '2024.05.31',
      minAmount: '10,000원',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsM55txNS1u1bsVR20N_YcWkF9aviivV4DLyg597Ry5UvkjA3oky6_tTucGdXReYyz4jS9G0HqSFugcNsE8GITyXBwDPexKg3KygvGG_-chmryEs1MvXltndG0BU1aeLqk-kF5ypfYF5fLK_YVgjVqYsGIKLOmhwNdKYZ3uXbTAJDeU48miHzn-YPihANrZp1FgWFk3IZnA48TtaB0ZBoIETUI1gXHWhxv2iIFMZJGAWTAbGdr1qZ_huhylfhOWmUusk1ls7Bsww1u',
      status: 'expired'
    },
    {
      id: '#000081',
      title: 'PT 10회 10% 할인',
      type: 'PT',
      discount: '10%',
      startDate: '2024.04.01',
      endDate: '2024.04.30',
      minAmount: '500,000원',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7kM_e56qZxnjc93vJBJDBiUqeKEagKT7rBpOjGC8Ckdw5kagkAgZI2F6rW4VpSwdHDc2so8v84hmUaTvnJxOUXToJfKuim8kEfGdNiHH2YrGfqrODZSjNE41kMILuD0iwJSj-bZScGqY0bOru5xRACq4qJCwgyG_G2XVsqGqTSeNwa88AyRbk4M8zRs7IhBugql4HVyP9y7Nk7fTSjJsAcE0NiXWyySQlBizN5lj0uCrqZ-WawgIK6OJiYBBhXM7SbghxM-w0Yp-2',
      status: 'expired'
    }
  ])

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1 bg-background-dark">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold tracking-tight text-white">내 할인권</h2>
              <button className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-lg font-bold text-black transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark">
                할인권 받기
              </button>
            </div>
          </div>
          
          <div className="space-y-12">
            {/* 보유한 할인권 */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-white">보유한 할인권</h3>
              <div className="space-y-6">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="overflow-hidden rounded-lg border border-primary/50 bg-primary/10 shadow-sm dark:bg-primary/20">
                    <div className="flex items-start gap-6 p-6">
                      <img 
                        alt="할인권 이미지" 
                        className="h-20 w-20 flex-shrink-0 rounded-md object-cover" 
                        src={coupon.image}
                      />
                      <div className="flex-grow">
                        <p className="mb-1 text-sm text-gray-400">{coupon.id}</p>
                        <p className="mb-2 text-2xl font-bold text-white">{coupon.title}</p>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <p className="text-lg text-gray-300">
                              시작 기간: <span className="font-bold text-white">{coupon.startDate}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-lg text-gray-300">
                              종료 기간: <span className="font-bold text-white">{coupon.endDate} (D-{coupon.daysLeft})</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 md:col-span-2">
                            <p className="text-lg text-gray-300">
                              최소 적용 금액: <span className="font-bold text-white">{coupon.minAmount}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between self-stretch">
                        <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold text-primary">
                          {coupon.type}
                        </span>
                        <p className="text-3xl font-bold text-primary">{coupon.discount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 만료/사용한 할인권 */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-white">만료/사용한 할인권</h3>
              <div className="space-y-6">
                {expiredCoupons.map((coupon) => (
                  <div key={coupon.id} className="overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-sm opacity-60">
                    <div className="flex items-start gap-6 p-6">
                      <img 
                        alt="만료된 할인권 이미지" 
                        className="h-20 w-20 flex-shrink-0 rounded-md object-cover" 
                        src={coupon.image}
                      />
                      <div className="flex-grow">
                        <p className="mb-1 text-sm text-gray-500">{coupon.id}</p>
                        <p className="mb-2 text-2xl font-bold text-gray-400">{coupon.title}</p>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <p className="text-lg text-gray-400">
                              시작 기간: <span className="font-bold">{coupon.startDate}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-lg text-gray-400">
                              종료 기간: <span className="font-bold">{coupon.endDate}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 md:col-span-2">
                            <p className="text-lg text-gray-400">
                              최소 적용 금액: <span className="font-bold">{coupon.minAmount}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between self-stretch">
                        <span className="inline-block rounded-full bg-gray-500/20 px-3 py-1 text-sm font-semibold text-gray-400">
                          {coupon.type}
                        </span>
                        <p className="text-3xl font-bold text-gray-400">{coupon.discount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
