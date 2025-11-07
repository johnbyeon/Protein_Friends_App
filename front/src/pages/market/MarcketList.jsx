import React, { useState } from "react";

export default function MarketList() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const products = [
    {
      id: 1,
      name: "프로틴 쉐이크",
      code: "PS-001",
      price: 35000,
      discount: 30000,
      status: "판매중",
      created: "2023-09-02",
      updated: "2023-09-02",
      stock: 50,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCd5Sv71uArDrChUCS8mFDVdEzhNBN37vqSQB2_uwzMib4CrW2I7_aKm0C1Zd6UDjWed1NSDe_irJVRFcP3fO3Za0Vt-2M1jgDxdvPq-mWhQlBUngoMguCyhAeYgvhdDi7rXY59ES17_LH0PfDrxl_yLw8mGHD5u53YWkvQdv_giR1gQGQL6NX5CnpoH06ktn_rKW4o-Oh3wUZRoWgaFnyyzgUzE9l-AGn19pcsP3zO1_ZBqHElg92xjGLPs2Iefp4bPgJ-7WTQB1U",
    },
    {
      id: 2,
      name: "요가 매트",
      code: "YM-002",
      price: 25000,
      discount: 22000,
      status: "판매중",
      created: "2023-09-01",
      updated: "2023-09-01",
      stock: 30,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDwRBqEsXNz2dSKl50VPszUx7GkS8Dl8u_ahfCjGreKItTBXCuJVulVgF_rS_BuLiaQLRVK59m0H9TcEJpaXjTq5MsBDEKSCIS_aMOJDCVNK5VGg9tsT-gWBVwqwmh5wDPF0W1Ptad-vjWKhL7c0_488pOVYct65BLCHFhKXJyTYBt18HKIIc0xXB3ebf7fujZ4RRfH9icG0BtL2uYx0xsDT5L0eta4F8YqO6KDG-YvW9-Oi4iHC2_EyHUIuDL2DlW3fRcKLPSDNJs",
    },
    {
      id: 3,
      name: "덤벨 세트 (5kg)",
      code: "DB-003",
      price: 50000,
      discount: 45000,
      status: "판매중",
      created: "2023-08-30",
      updated: "2023-08-30",
      stock: 20,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDC22zc6hhtqVK5AbQb9zUXfPx5504eMSlcrbj2Ji7-R84eJmE7kPkvOo9TBPYxTCRltXZroj5ZQ_ggOMiG5poeJM6PSASNqEH87GF1WbAGXndDcNY8O-GQtGR78b17Pk_biNxaeu1o5AMnMsPRyBir3lh8d0MBmhWcMWiSLXvv27kqgApM6SwoDkB2dT9dg65JsfQncYlXjZ-X6OVV7ehOoHwyVkKO9Wf434-B9dz1YksctBYPIrvJ9buzJFxea2gEU6_zyAmtvaw",
    },
    {
      id: 4,
      name: "스포츠 타월",
      code: "ST-004",
      price: 12000,
      discount: 10000,
      status: "품절",
      created: "2023-08-29",
      updated: "2023-08-29",
      stock: 0,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCh4_TaiIJ1O0BtiM5b60c3lro4NVp-SP-EQSRgxv9VxC1rEW2_SLLjTwtxm4mRy2ctkpPCVsfjrb1TrWnbppIfZRFIorzz0IwNeyVKGoQBpTMMTemFljEcSHOjEjwQCJlnz9MFbgH4vEAIHzWArYw8-SJQsVAw7KmpuaSNb-0HIPRNAftzrdhgtvVaulr6bM1ff7q38dNJrnETf8WZXTx9eb_tiPZe9Bx66aua0K2qECuejJODu2rYQGeCNlwvNMYbu26vRWhwD8I",
    },
    {
      id: 5,
      name: "폼롤러",
      code: "FR-005",
      price: 18000,
      discount: 15000,
      status: "판매중",
      created: "2023-08-28",
      updated: "2023-08-28",
      stock: 25,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC2BrQxUE3i26trqsBuPfqt2T58RKSl2VGky_FfFpbPm1hbImzhhTUnaH9uwzzWIUtciPW1wJoQpMks5GuQd2LOmp0mKqOQI5iSnxUOtt34PXwuUf6gKaonosQNUAjjhYzuVq9vwJybqojBUP2hf0vg94YLmeMA5c7gqy8NIxTlP5oEN2Td31oAxiUjzF9EV8cbcGVy5I9VUzCypvAmBcOyCivYbvSU13cAwpUgt5Ey1oFqItgbbSng1Ve4TZM4HOds9-8Q64YRY4k",
    },
  ];

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
          {!sidebarCollapsed && (
            <h1 className="text-lg font-bold text-text-light">마켓 관리</h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-text-dark hover:text-text-light toggle-button"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { icon: "store", label: "마켓상품", active: true },
            { icon: "sell", label: "할인권" },
            { icon: "schedule", label: "기간제 회원권" },
            { icon: "fitness_center", label: "PT 이용권" },
          ].map((item, i) => (
            <a
              key={i}
              href="#"
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${
                item.active
                  ? "bg-primary text-white"
                  : "text-text-light hover:bg-primary/20"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-text-light">상품 관리</h2>
            <p className="text-text-dark mt-1">상품 목록, 재고 및 가격을 관리합니다.</p>
          </div>

          <div className="bg-[#111111] rounded-lg shadow-sm">
            {/* 상단 검색 및 버튼 */}
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
                <button className="bg-primary text-white flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg">
                  <span className="material-symbols-outlined text-base">add</span>
                  상품 추가
                </button>
              </div>
            </div>

            {/* 상품 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-text-dark">
                <thead className="text-xs text-text-light uppercase bg-background-dark border-b border-border-color">
                  <tr>
                    {[
                      "상품번호",
                      "사진",
                      "상품이름",
                      "상품코드",
                      "상품정상가",
                      "상품할인가",
                      "상품상태",
                      "상품등록일",
                      "상품수정일",
                      "재고수량",
                      "관리",
                    ].map((h) => (
                      <th key={h} className="px-6 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="bg-[#111111] border-b border-border-color hover:bg-[#1f1f1f]"
                    >
                      <td className="px-6 py-4">{p.id}</td>
                      <td className="px-6 py-4">
                        <div
                          className="bg-center bg-cover rounded-lg w-10 h-10"
                          style={{ backgroundImage: `url(${p.image})` }}
                        />
                      </td>
                      <td className="px-6 py-4 text-white">{p.name}</td>
                      <td className="px-6 py-4">{p.code}</td>
                      <td className="px-6 py-4">₩{p.price.toLocaleString()}</td>
                      <td className="px-6 py-4">₩{p.discount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            p.status === "판매중"
                              ? "bg-green-900 text-green-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{p.created}</td>
                      <td className="px-6 py-4">{p.updated}</td>
                      <td className="px-6 py-4">{p.stock}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-text-light hover:text-primary">
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button className="text-text-light hover:text-primary">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 하단 페이지네이션 */}
            <div className="p-4 flex justify-between items-center text-sm">
              <span className="text-text-dark">1-5 / 20개 상품 표시 중</span>
              <nav>
                <ul className="inline-flex items-center -space-x-px">
                  {["chevron_left", "1", "2", "3", "4", "chevron_right"].map(
                    (v, i) => (
                      <li key={i}>
                        <a
                          href="#"
                          className={`flex items-center justify-center px-3 h-8 border border-border-color ${
                            v === "1"
                              ? "bg-primary text-white border-primary"
                              : "text-text-dark bg-background-dark hover:bg-gray-700 hover:text-white"
                          } ${i === 0 ? "rounded-s-lg" : ""} ${
                            i === 5 ? "rounded-e-lg" : ""
                          }`}
                        >
                          {v.startsWith("chevron") ? (
                            <span className="material-symbols-outlined text-base">
                              {v}
                            </span>
                          ) : (
                            v
                          )}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
