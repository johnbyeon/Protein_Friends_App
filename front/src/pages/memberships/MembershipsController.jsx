import React, { useState } from "react";

export default function MembershipsController() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addPrice, setAddPrice] = useState(0);
  const [addDiscount, setAddDiscount] = useState(0);
  const [editPrice, setEditPrice] = useState(150000);
  const [editDiscount, setEditDiscount] = useState(15000);

  return (
    <div className="bg-background-dark font-display text-text-light min-h-screen flex">
      {/* Sidebar */}
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
            className="text-text-dark hover:text-text-light"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-text-light hover:bg-primary/20"
          >
            <span className="material-symbols-outlined">store</span>
            {!sidebarCollapsed && <span>마켓상품</span>}
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-text-light hover:bg-primary/20"
          >
            <span className="material-symbols-outlined">confirmation_number</span>
            {!sidebarCollapsed && <span>할인권</span>}
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-primary text-white"
          >
            <span className="material-symbols-outlined">schedule</span>
            {!sidebarCollapsed && <span>기간제 회원권</span>}
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-text-light hover:bg-primary/20"
          >
            <span className="material-symbols-outlined">fitness_center</span>
            {!sidebarCollapsed && <span>PT 이용권</span>}
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-text-light">
                기간제 회원권 관리
              </h2>
              <p className="text-text-dark mt-1">
                회원권 목록, 기간 및 가격을 관리합니다.
              </p>
            </div>

            {/* Header with search & buttons */}
            <div className="bg-[#111111] rounded-lg shadow-sm">
              <div className="p-4 flex justify-between items-center border-b border-border-color">
                <div className="relative w-full max-w-sm">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-dark">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="회원권 이름으로 검색"
                    className="pl-10 pr-4 py-2 w-full bg-background-dark text-text-light rounded-lg border border-border-color focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border-color hover:bg-primary/20">
                    <span className="material-symbols-outlined text-base">
                      filter_list
                    </span>
                    필터
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    회원권 추가
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-text-dark">
                  <thead className="text-xs text-text-light uppercase bg-background-dark border-b border-border-color">
                    <tr>
                      <th className="px-6 py-3">회원권 번호</th>
                      <th className="px-6 py-3">이미지</th>
                      <th className="px-6 py-3">회원권 이름</th>
                      <th className="px-6 py-3">회원권 기간</th>
                      <th className="px-6 py-3">정상가</th>
                      <th className="px-6 py-3">할인금액</th>
                      <th className="px-6 py-3">판매가격</th>
                      <th className="px-6 py-3">상품 상태</th>
                      <th className="px-6 py-3">생성 날짜</th>
                      <th className="px-6 py-3">수정 날짜</th>
                      <th className="px-6 py-3 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 예시 한 개만 유지 */}
                    <tr className="bg-[#111111] border-b border-border-color hover:bg-[#1f1f1f]">
                      <td className="px-6 py-4">1</td>
                      <td className="px-6 py-4">
                        <img
                          alt="1개월 회원권"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi2vsJDm8J0xDZpT9KswgveklqVNIx7N-YEssaoF-CX9GpDDTFNILPfroWIzRKLrvfAh7pBL8xed7O1xlyadPytLIvevaW7zyRdHzp3N3vjlFqwAVTPsZGskJUn9lJX4xh-4fPb37eGZOd5Y7GQGG8odX3kxNFk30cNS3B4myWYccaI5-C9-m7ybeAAG6dbORqUsszBHRI2AboHgEZsRqrt-hl4rrs3uDTBuoCL4BHBWvvNEzpwo4U_YPiPmGOwfIklzrWgcX9rqg"
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 text-text-light">1개월 회원권</td>
                      <td className="px-6 py-4">30일</td>
                      <td className="px-6 py-4 text-text-light">₩50,000</td>
                      <td className="px-6 py-4 text-text-light">₩5,000</td>
                      <td className="px-6 py-4 text-primary font-bold">₩45,000</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900 text-green-300">
                          판매중
                        </span>
                      </td>
                      <td className="px-6 py-4">2023-09-01</td>
                      <td className="px-6 py-4">2023-09-01</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setShowEditModal(true)}
                            className="text-text-light hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button className="text-text-light hover:text-primary transition-colors">
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
      </div>

      {/* 회원권 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-[#111111] rounded-xl shadow-xl w-full max-w-lg p-8 m-4">
            <h3 className="text-2xl font-bold text-text-light mb-6">회원권 추가</h3>
            <form>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    정상가
                  </label>
                  <input
                    type="number"
                    value={addPrice}
                    onChange={(e) => setAddPrice(Number(e.target.value))}
                    className="w-full bg-background-dark text-text-light rounded-lg border border-border-color px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    할인금액
                  </label>
                  <input
                    type="number"
                    value={addDiscount}
                    onChange={(e) => setAddDiscount(Number(e.target.value))}
                    className="w-full bg-background-dark text-text-light rounded-lg border border-border-color px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    판매가격
                  </label>
                  <input
                    type="number"
                    value={addPrice - addDiscount}
                    readOnly
                    className="w-full bg-gray-700 text-gray-400 rounded-lg border border-border-color px-4 py-2.5"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 text-sm font-semibold text-text-light bg-transparent rounded-lg border border-border-color hover:bg-gray-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 회원권 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-[#111111] rounded-xl shadow-xl w-full max-w-lg p-8 m-4">
            <h3 className="text-2xl font-bold text-text-light mb-6">회원권 수정</h3>
            <form>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    정상가
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-background-dark text-text-light rounded-lg border border-border-color px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    할인금액
                  </label>
                  <input
                    type="number"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(Number(e.target.value))}
                    className="w-full bg-background-dark text-text-light rounded-lg border border-border-color px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    판매가격
                  </label>
                  <input
                    type="number"
                    value={editPrice - editDiscount}
                    readOnly
                    className="w-full bg-gray-700 text-gray-400 rounded-lg border border-border-color px-4 py-2.5"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 text-sm font-semibold text-text-light bg-transparent rounded-lg border border-border-color hover:bg-gray-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
