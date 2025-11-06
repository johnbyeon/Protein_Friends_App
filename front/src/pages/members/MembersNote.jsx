// src/pages/admin/MembersNote.jsx
import React, { useState } from "react"

export default function MembersNote() {
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isMember, setIsMember] = useState(false)
  const [filterTrainer, setFilterTrainer] = useState("전체")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterMember, setFilterMember] = useState("all")

  const tableData = [
    { id: 1, title: "신규 상담 문의", trainer: "Alex", member: "미등록", name: "N/A", status: "진행 중", created: "2024-07-25 10:00", updated: "2024-07-25 10:00" },
    { id: 2, title: "개인 PT 상담", trainer: "Emily", member: "회원", name: "홍길동", status: "진행 중", created: "2024-07-24 14:30", updated: "2024-07-24 14:30" },
    { id: 3, title: "그룹 수업 문의", trainer: "David", member: "미등록", name: "N/A", status: "완료", created: "2024-07-23 09:00", updated: "2024-07-23 09:00" },
    { id: 4, title: "식단 관리 상담", trainer: "Sophia", member: "회원", name: "김철수", status: "진행 중", created: "2024-07-22 16:00", updated: "2024-07-22 16:00" },
    { id: 5, title: "헬스장 이용 문의", trainer: "Alex", member: "미등록", name: "N/A", status: "진행 중", created: "2024-07-21 11:00", updated: "2024-07-21 11:00" },
  ]

  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 min-h-screen p-6 lg:p-8 font-display">
      <div className="max-w-full mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">상담 관리 리스트</h1>
          <div className="flex items-center space-x-2">
            {/* 필터 버튼 */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center"
              >
                <span className="material-symbols-outlined mr-2">filter_alt</span>필터
              </button>
              {showFilters && (
                <div className="absolute right-0 mt-2 w-80 bg-background-light dark:bg-gray-900 rounded-lg shadow-xl z-20 p-4 space-y-4">
                  {/* 담당 트레이너 */}
                  <div>
                    <label className="block text-sm font-medium mb-1">담당 트레이너</label>
                    <select
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2"
                      value={filterTrainer}
                      onChange={(e) => setFilterTrainer(e.target.value)}
                    >
                      <option>전체</option>
                      <option>Alex</option>
                      <option>Emily</option>
                      <option>David</option>
                      <option>Sophia</option>
                    </select>
                  </div>
                  {/* 회원 여부 */}
                  <div>
                    <label className="block text-sm font-medium mb-1">회원 여부</label>
                    <div className="flex gap-4">
                      {["전체", "회원", "미등록"].map((type, i) => (
                        <label key={i} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="member-filter"
                            className="form-radio text-primary focus:ring-primary"
                            checked={
                              (type === "전체" && filterMember === "all") ||
                              (type === "회원" && filterMember === "member") ||
                              (type === "미등록" && filterMember === "non-member")
                            }
                            onChange={() =>
                              setFilterMember(
                                type === "전체" ? "all" : type === "회원" ? "member" : "non-member"
                              )
                            }
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* 상태 */}
                  <div>
                    <label className="block text-sm font-medium mb-1">상담 진행 상태</label>
                    <div className="flex gap-4">
                      {["전체", "진행중", "완료"].map((status, i) => (
                        <label key={i} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="status-filter"
                            className="form-radio text-primary focus:ring-primary"
                            checked={
                              (status === "전체" && filterStatus === "all") ||
                              (status === "진행중" && filterStatus === "in-progress") ||
                              (status === "완료" && filterStatus === "completed")
                            }
                            onChange={() =>
                              setFilterStatus(
                                status === "전체"
                                  ? "all"
                                  : status === "진행중"
                                  ? "in-progress"
                                  : "completed"
                              )
                            }
                          />
                          <span>{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      초기화
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-red-700"
                    >
                      적용
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
            >
              상담 추가
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-background-light dark:bg-gray-900 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase">
                <tr>
                  {[
                    "상담 번호",
                    "상담 제목",
                    "담당 트레이너",
                    "회원여부",
                    "회원명",
                    "등록 시간",
                    "수정 시간",
                    "진행 상태",
                    "",
                  ].map((th, i) => (
                    <th key={i} className="px-6 py-3 whitespace-nowrap">
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4 font-medium">{row.id}</td>
                    <td className="px-6 py-4">{row.title}</td>
                    <td className="px-6 py-4">{row.trainer}</td>
                    <td className="px-6 py-4">{row.member}</td>
                    <td className="px-6 py-4">{row.name}</td>
                    <td className="px-6 py-4">{row.created}</td>
                    <td className="px-6 py-4">{row.updated}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          row.status === "완료"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="text-primary hover:text-red-700 font-medium"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 상담 추가 모달 */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-background-light dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
              <h2 className="text-2xl font-bold mb-6">상담 추가</h2>
              <form className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-primary focus:ring-primary"
                    checked={isMember}
                    onChange={(e) => setIsMember(e.target.checked)}
                  />
                  <span className="ml-2">회원여부</span>
                </label>

                {isMember && (
                  <div>
                    <label className="block text-sm mb-1">회원 검색</label>
                    <input
                      type="text"
                      placeholder="회원 이름 또는 번호 검색"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm mb-1">담당 트레이너</label>
                  <select className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2">
                    <option>Alex</option>
                    <option>Emily</option>
                    <option>David</option>
                    <option>Sophia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">상담 제목</label>
                  <input className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2" />
                </div>

                <div>
                  <label className="block text-sm mb-1">상담 내용</label>
                  <textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2" rows="3" />
                </div>

                <div>
                  <label className="block text-sm mb-1">조치 내용</label>
                  <textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2" rows="3" />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    취소
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-red-700">
                    저장
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
