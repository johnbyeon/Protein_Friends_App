import React from 'react';

export default function MyPTPasses() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-bold tracking-tight text-white">내 PT 이용권</h2>
          <a
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-lg font-bold text-background-dark transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark"
            href="#"
          >
            구매하러 가기
          </a>
        </div>
      </div>
      <div className="space-y-12">
        <div>
          <h3 className="mb-4 text-xl font-bold text-white">사용 중인 이용권</h3>
          <div className="overflow-hidden rounded-lg border border-primary/50 bg-primary/10 shadow-sm dark:bg-primary/20">
            <div className="flex items-start gap-6 p-6">
              <img
                alt="PT 이용권 이미지"
                className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNpcoa1yJlWeBeClD8k6IEp_o3wMckTV6U9dNIPTE0twG3ld5A1T1jH2lraQrLb7UT6UuYI7eBtjPx5B2YMKcc2p4dFzd3oeE5RXJd_WbunsDib-jxigEBRJDnBYWmOxzt9qKQ0BR-qacrzS7k7exw92vcNJAz7jesH42tOZU_-7U8hywWLPbXQL8ijJPpHCVX8hnnF2QzvrcLRd_o8IKQhsjrCcObHr95iX0B3RllaRe1OPSKlMpV1ifXrrrwpYFluwlRMv5QWZy8"
              />
              <div className="flex-grow">
                <p className="mb-2 text-2xl font-bold text-white">PT 30회 이용권</p>
                <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <p className="text-lg text-gray-300">총 횟수: <span className="font-bold text-white">30회</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg text-gray-300">남은 횟수: <span className="font-bold text-white">15회</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg text-gray-300">시작일: <span className="font-bold text-white">2024.06.01</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg text-gray-300">만료 기간: <span className="font-bold text-white">2024.08.31 (D-30)</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg text-gray-300">담당 트레이너: <span className="font-bold text-white">김철수</span></p>
                  </div>
                </div>
              </div>
              <div className="mt-4 w-full border-t border-primary/30 pt-4 text-right md:mt-0 md:w-auto md:border-0 md:pt-0">
                <div className="space-y-1 text-sm text-gray-400">
                  <p>정가: <span className="text-gray-400 line-through">₩2,000,000</span></p>
                  <p>할인: <span className="text-primary">-₩500,000</span></p>
                </div>
                <p className="mt-1 text-lg font-bold text-white">구매 가격: <span className="text-primary">₩1,500,000</span></p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-xl font-bold text-white">만료된 이용권</h3>
          <div className="space-y-6">
            {/* 만료된 이용권 1 */}
            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-sm opacity-60">
              <div className="flex items-start gap-6 p-6">
                <img
                  alt="만료된 PT 이용권 이미지"
                  className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6iTEMzUumlSN_kZuMYCwwDs1P5wMG4RTKKDoFYsoySO7HPHEqjIIrkH2sGDns89NpwpPd7LXcB5PcmXyeW9-JkpN34S-VRW1vjQDJIc9wabWxNEUxKOqRSR37QeuVL-04o2UflYS2ZxsVLY8gZvqFOjw5vlZucFtPkXf1xrKJQEnAO03JaypTdpjgnFLBmbFLDJwjI64ysYAa86qANzsD14qxE4ju30AuDwz2KkoW15fxLnAa0bUPB0ZFMaNZjfTQvOp2vt9CR-3r"
                />
                <div className="flex-grow">
                  <p className="mb-2 text-2xl font-bold text-white">PT 30회 이용권</p>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-gray-400">총 횟수: <span className="font-bold">30회</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-gray-400">남은 횟수: <span className="font-bold">0회</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-gray-400">시작일: <span className="font-bold">2024.02.15</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-gray-400">만료 기간: <span className="font-bold">2024.05.15</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-gray-400">담당 트레이너: <span className="font-bold">김철수</span></p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 w-full border-t border-white/20 pt-4 text-right md:mt-0 md:w-auto md:border-0 md:pt-0">
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>정가: <span className="text-gray-500 line-through">₩2,000,000</span></p>
                    <p>할인: <span>-₩500,000</span></p>
                  </div>
                  <p className="mt-1 text-lg font-bold text-gray-400">구매 가격: <span>₩1,500,000</span></p>
                </div>
              </div>
            </div>

            {/* 만료된 이용권 2 */}
            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-sm opacity-60">
              <div className="flex items-start gap-6 p-6">
                <img
                  alt="만료된 PT 이용권 이미지"
                  className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLTRHQmTsKlDxSifK28CC4VZKNqQb3jhhGhAFLVWYaOtplcjNiU_4YU8H6cAvJ9bhAnlx2QLLWEIXV6WSUl6m7VDEG-FFZsVOn-7-mcaz1P4mSj5fS1xtDMUxrDbQImbuiDEVqj3fqUts1dNeCRoHs3KbheVSvSKBsasWOBKj3winOCoiiO86LAU1hKxsv_On-QPQ5JqRVPorxdWTqFFQVAkBU3vBLshFzY6Qg53xaD8HFS504JHjHgaIyWkyRUdev-wScLq6U3wBG"
                />
                <div className="flex-grow">
                  <p className="mb-2 text-2xl font-bold text-white">PT 20회 이용권</p>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-gray-400">총 횟수: <span className="font-bold">20회</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-gray-400">남은 횟수: <span className="font-bold">0회</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-gray-400">시작일: <span className="font-bold">2024.02.20</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-gray-400">만료 기간: <span className="font-bold">2024.04.20</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-gray-400">담당 트레이너: <span className="font-bold">박영희</span></p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 w-full border-t border-white/20 pt-4 text-right md:mt-0 md:w-auto md:border-0 md:pt-0">
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>정가: <span className="text-gray-500 line-through">₩1,500,000</span></p>
                    <p>할인: <span>-₩200,000</span></p>
                  </div>
                  <p className="mt-1 text-lg font-bold text-gray-400">구매 가격: <span>₩1,300,000</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
