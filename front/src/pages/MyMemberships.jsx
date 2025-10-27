import React from 'react';

export default function MyMemberships() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-4xl font-bold tracking-tight text-white">내 기간제 회원권</h2>
        <a
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-background-dark transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark"
          href="#"
        >
          구매하러 가기
        </a>
      </div>
      <div className="space-y-12">
        <div>
          <h3 className="mb-4 text-xl font-bold text-white">내 회원권 정보</h3>
          <div className="overflow-hidden rounded-lg border border-primary/50 bg-primary/10 shadow-sm dark:bg-primary/20">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                <div className="mb-4 w-full md:mb-0 md:w-1/3">
                  <img
                    alt="헬스장 내부 사진"
                    className="aspect-square w-full rounded-lg object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTC11ySYBm2vvWsTw6fcyTiQMNqjstX3uu3F9HrG-u_cgMg1i6QM2HfvvOg8_LJ_taSXwhVDOIbSP5W4P4wWqY3IoqLqZcnJTfK2X7Tq3uLBJ01kdpxWPj999_i3Gp98Is1zsSxBKaOBUQphkW6JBmg_NzkIu2LsD55-6IDAexfrckk5VZwKHc6Ga5PFhare-qu5f-CT77R-Jo9Jza_KJ8KDP7tw__ESN4hTdbXSbdIWgHr95yd_gd3GmoXk4UECbM3tjONQBTdc7h"
                  />
                </div>
                <div className="flex-grow md:w-2/3">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <p className="mb-2 text-2xl font-bold text-white">헬스장 3개월 이용권</p>
                      <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
                        사용 중
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-300">회원권 번호: <span className="font-bold text-white">M-20240601-001</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-300">구매일: <span className="font-bold text-white">2024.05.31</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-300">시작일: <span className="font-bold text-white">2024.06.01</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-300">종료일: <span className="font-bold text-white">2024.08.31</span></p>
                      </div>
                      <div className="col-span-1 flex items-center gap-2 sm:col-span-2">
                        <p className="text-lg text-gray-300">정지 가능 횟수: <span className="font-bold text-white">(1/3)</span></p>
                      </div>
                    </div>
                    <div className="mt-4 border-t border-primary/30 pt-4 text-right">
                      <div className="space-y-1 text-sm text-gray-400">
                        <p>정가: <span className="text-gray-400 line-through">₩300,000</span></p>
                        <p>할인: <span className="text-primary">-₩50,000</span></p>
                      </div>
                      <p className="mt-1 text-lg font-bold text-white">구매 가격: <span className="text-primary">₩250,000</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-xl font-bold text-white">만료/정지/취소된 회원권</h3>
          <div className="space-y-6">
            {/* 만료된 회원권 */}
            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-sm opacity-60">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:gap-6">
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <p className="mb-2 text-2xl font-bold text-white">헬스장 1개월 이용권</p>
                      <span className="inline-flex items-center rounded-full bg-gray-700 px-3 py-1 text-sm font-medium text-gray-300">
                        만료
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-400">회원권 번호: <span className="font-bold text-white">M-20240215-002</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-400">구매일: <span className="font-bold text-white">2024.02.14</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-400">시작일: <span className="font-bold text-white">2024.02.15</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-400">종료일: <span className="font-bold text-white">2024.03.15</span></p>
                      </div>
                      <div className="col-span-1 flex items-center gap-2 sm:col-span-2">
                        <p className="text-lg text-gray-400">정지 가능 횟수: <span className="font-bold text-white">(0/1)</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 w-full border-t border-white/20 pt-4 text-right md:mt-0 md:w-auto md:flex-shrink-0 md:border-0 md:pt-0">
                    <div className="space-y-1 text-sm text-gray-500">
                      <p>정가: <span className="text-gray-500 line-through">₩100,000</span></p>
                      <p>할인: <span>-₩0</span></p>
                    </div>
                    <p className="mt-1 text-lg font-bold text-gray-400">구매 가격: <span>₩100,000</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* 정지된 회원권 */}
            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-sm opacity-60">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:gap-6">
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <p className="mb-2 text-2xl font-bold text-white">헬스장 6개월 이용권</p>
                      <span className="inline-flex items-center rounded-full bg-yellow-900/80 px-3 py-1 text-sm font-medium text-yellow-300">
                        정지
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-400">회원권 번호: <span className="font-bold text-white">M-20231201-001</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-400">구매일: <span className="font-bold text-white">2023.11.30</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-400">시작일: <span className="font-bold text-white">2023.12.01</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-400">종료일: <span className="font-bold text-white">2024.05.31</span></p>
                      </div>
                      <div className="col-span-1 flex items-center gap-2 sm:col-span-2">
                        <p className="text-lg text-gray-400">정지 가능 횟수: <span className="font-bold text-white">(2/2)</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 w-full border-t border-white/20 pt-4 text-right md:mt-0 md:w-auto md:flex-shrink-0 md:border-0 md:pt-0">
                    <div className="space-y-1 text-sm text-gray-500">
                      <p>정가: <span className="text-gray-500 line-through">₩500,000</span></p>
                      <p>할인: <span>-₩100,000</span></p>
                    </div>
                    <p className="mt-1 text-lg font-bold text-gray-400">구매 가격: <span>₩400,000</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* 취소된 회원권 */}
            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-sm opacity-60">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:gap-6">
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <p className="mb-2 text-2xl font-bold text-white">헬스장 12개월 이용권</p>
                      <span className="inline-flex items-center rounded-full bg-red-900/80 px-3 py-1 text-sm font-medium text-red-300">
                        취소
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-400">회원권 번호: <span className="font-bold text-white">M-20231001-003</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-400">구매일: <span className="font-bold text-white">2023.09.30</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-400">시작일: <span className="font-bold text-white">2023.10.01</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-400">종료일: <span className="font-bold text-white">2024.09.30</span></p>
                      </div>
                      <div className="col-span-1 flex items-center gap-2 sm:col-span-2">
                        <p className="text-lg text-gray-400">정지 가능 횟수: <span className="font-bold text-white">(0/5)</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 w-full border-t border-white/20 pt-4 text-right md:mt-0 md:w-auto md:flex-shrink-0 md:border-0 md:pt-0">
                    <div className="space-y-1 text-sm text-gray-500">
                      <p>정가: <span className="text-gray-500 line-through">₩800,000</span></p>
                      <p>할인: <span>-₩200,000</span></p>
                    </div>
                    <p className="mt-1 text-lg font-bold text-gray-400">구매 가격: <span>₩600,000</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
