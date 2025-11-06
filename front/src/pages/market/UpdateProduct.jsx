// src/pages/admin/UpdateProduct.jsx
import React, { useState } from "react"

export default function UpdateProduct() {
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewTab, setPreviewTab] = useState("info")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [quantity, setQuantity] = useState(1)

  // 예시 이미지 리스트
  const productImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCd5Sv71uArDrChUCS8mFDVdEzhNBN37vqSQB2_uwzMib4CrW2I7_aKm0C1Zd6UDjWed1NSDe_irJVRFcP3fO3Za0Vt-2M1jgDxdvPq-mWhQlBUngoMguCyhAeYgvhdDi7rXY59ES17_LH0PfDrxl_yLw8mGHD5u53YWkvQdv_giR1gQGQL6NX5CnpoH06ktn_rKW4o-Oh3wUZRoWgaFnyyzgUzE9l-AGn19pcsP3zO1_ZBqHElg92xjGLPs2Iefp4bPgJ-7WTQB1U",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDC22zc6hhtqVK5AbQb9zUXfPx5504eMSlcrbj2Ji7-R84eJmE7kPkvOo9TBPYxTCRltXZroj5ZQ_ggOMiG5poeJM6PSASNqEH87GF1WbAGXndDcNY8O-GQtGR78b17Pk_biNxaeu1o5AMnMsPRyBir3lh8d0MBmhWcMWiSLXvv27kqgApM6SwoDkB2dT9dg65JsfQncYlXjZ-X6OVV7ehOoHwyVkKO9Wf434-B9dz1YksctBYPIrvJ9buzJFxea2gEU6_zyAmtvaw",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCh4_TaiIJ1O0BtiM5b60c3lro4NVp-SP-EQSRgxv9VxC1rEW2_SLLjTwtxm4mRy2ctkpPCVsfjrb1TrWnbppIfZRFIorzz0IwNeyVKGoQBpTMMTemFljEcSHOjEjwQCJlnz9MFbgH4vEAIHzWArYw8-SJQsVAw7KmpuaSNb-0HIPRNAftzrdhgtvVaulr6bM1ff7q38dNJrnETf8WZXTx9eb_tiPZe9Bx66aua0K2qECuejJODu2rYQGeCNlwvNMYbu26vRWhwD8I",
  ]
  const [activeImage, setActiveImage] = useState(productImages[0])

  return (
    <div className="bg-background-dark font-display text-text-light min-h-screen flex">
      {/* 사이드바 */}
      <aside
        id="sidebar"
        className={`${
          sidebarCollapsed ? "w-16" : "w-56"
        } bg-background-dark border-r border-border-color flex flex-col transition-all duration-300`}
      >
        <div className="h-16 flex items-center justify-between px-4 gap-3 sidebar-header">
          <h1 className="text-lg font-bold text-text-light">마켓 관리</h1>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-text-dark hover:text-text-light"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <a className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-primary text-white">
            <span className="material-symbols-outlined">store</span>
            {!sidebarCollapsed && <span>마켓상품</span>}
          </a>
          <a className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-text-light hover:bg-primary/20">
            <span className="material-symbols-outlined">schedule</span>
            {!sidebarCollapsed && <span>기간제 회원권</span>}
          </a>
          <a className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-text-light hover:bg-primary/20">
            <span className="material-symbols-outlined">fitness_center</span>
            {!sidebarCollapsed && <span>PT 이용권</span>}
          </a>
        </nav>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-text-light mb-2">상품 관리</h2>
          <p className="text-text-dark mb-8">상품 목록, 재고 및 가격을 관리합니다.</p>

          <div className="bg-card-bg rounded-lg shadow-sm border border-border-color">
            <div className="p-4 flex justify-between items-center border-b border-border-color">
              <div className="relative w-full max-w-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-dark">
                  search
                </span>
                <input
                  type="text"
                  placeholder="상품명 또는 코드로 검색"
                  className="pl-10 pr-4 py-2 w-full bg-background-dark text-text-light rounded-lg border border-border-color focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border-color hover:bg-primary/20">
                  <span className="material-symbols-outlined text-base">filter_list</span>
                  필터
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary text-white flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  상품 추가
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-text-dark">
                <thead className="text-xs text-text-light uppercase bg-background-dark border-b border-border-color">
                  <tr>
                    <th className="px-6 py-3">상품번호</th>
                    <th className="px-6 py-3">사진</th>
                    <th className="px-6 py-3">상품이름</th>
                    <th className="px-6 py-3">상품코드</th>
                    <th className="px-6 py-3">정상가</th>
                    <th className="px-6 py-3">할인가</th>
                    <th className="px-6 py-3">상태</th>
                    <th className="px-6 py-3">등록일</th>
                    <th className="px-6 py-3">수정일</th>
                    <th className="px-6 py-3">재고</th>
                    <th className="px-6 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-card-bg border-b border-border-color hover:bg-[#1f1f1f]">
                    <td className="px-6 py-4">1</td>
                    <td className="px-6 py-4">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg w-10 h-10"
                        style={{
                          backgroundImage: `url(${productImages[0]})`,
                        }}
                      ></div>
                    </td>
                    <td className="px-6 py-4">프로틴 쉐이크</td>
                    <td className="px-6 py-4">PS-001</td>
                    <td className="px-6 py-4">₩35,000</td>
                    <td className="px-6 py-4">₩30,000</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900 text-green-300">
                        판매중
                      </span>
                    </td>
                    <td className="px-6 py-4">2023-09-02</td>
                    <td className="px-6 py-4">2023-09-02</td>
                    <td className="px-6 py-4">50</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="text-text-light hover:text-primary"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button className="text-text-light hover:text-primary">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* 상품 수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50">
          <div className="bg-card-bg rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border-color flex justify-between items-center">
              <h3 className="text-xl font-bold">상품 수정</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setIsPreviewModalOpen(true)
                }}
                className="px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-2 bg-background-dark text-text-light hover:bg-border-color/50"
              >
                <span className="material-symbols-outlined text-base">visibility</span>
                미리보기
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* 이미지 슬라이더 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="relative aspect-square bg-background-dark rounded-lg">
                    <img
                      src={activeImage}
                      alt="Product"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 flex justify-between items-center opacity-0 hover:opacity-100 bg-black/30 px-2">
                      <button
                        onClick={() => {
                          const i = productImages.indexOf(activeImage)
                          setActiveImage(
                            productImages[(i - 1 + productImages.length) % productImages.length]
                          )
                        }}
                        className="bg-black/50 text-white p-2 rounded-full"
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      <button
                        onClick={() => {
                          const i = productImages.indexOf(activeImage)
                          setActiveImage(productImages[(i + 1) % productImages.length])
                        }}
                        className="bg-black/50 text-white p-2 rounded-full"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {productImages.map((img) => (
                      <button
                        key={img}
                        onClick={() => setActiveImage(img)}
                        className={`rounded ${
                          activeImage === img ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 상품 입력 영역 */}
                <div className="md:col-span-2 space-y-4">
                  <input
                    type="text"
                    className="w-full bg-background-dark text-text-light border border-border-color rounded-lg p-2"
                    defaultValue="프로틴 쉐이크"
                  />
                  <input
                    type="text"
                    className="w-full bg-background-dark text-text-light border border-border-color rounded-lg p-2"
                    defaultValue="PS-001"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      defaultValue="₩35,000"
                      className="w-full bg-background-dark text-text-light border border-border-color rounded-lg p-2"
                    />
                    <input
                      type="text"
                      defaultValue="₩30,000"
                      className="w-full bg-background-dark text-text-light border border-border-color rounded-lg p-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border-color flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-border-color rounded-lg hover:bg-border-color/50"
              >
                취소
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 미리보기 모달 */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50">
          <div className="bg-card-bg rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border-color flex justify-between items-center">
              <h3 className="text-xl font-bold">상품 미리보기</h3>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-text-dark hover:text-text-light"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <h1 className="text-2xl font-bold mb-2">프로틴 쉐이크</h1>
              <p className="text-primary text-lg mb-4">₩30,000</p>
              <p className="text-text-light mb-4">
                최고급 유청 단백질을 사용하여 근육 성장과 회복을 돕는 프리미엄 프로틴 쉐이크입니다.
              </p>
            </div>

            <div className="p-6 border-t border-border-color flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false)
                  setIsModalOpen(true)
                }}
                className="bg-primary text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary/90"
              >
                편집으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
