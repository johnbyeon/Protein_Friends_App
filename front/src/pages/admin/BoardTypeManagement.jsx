import { useState, useEffect } from 'react'
import { useBoardTypeStore } from '../../stores/boardTypeStore'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

/**
 * 드래그 가능한 리스트 아이템 컴포넌트
 */
function SortableItem({ boardType, onEdit, onDelete, loading }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: boardType.ptypeid
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-white/5 p-3 rounded-md hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center gap-3 flex-1">
        {/* 드래그 핸들 */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-white/50 hover:text-white/80 transition-colors"
          disabled={loading}
        >
          <span className="material-symbols-outlined">drag_indicator</span>
        </button>

        <div className="flex flex-col gap-1">
          <span className="text-text-light dark:text-white/80 font-medium">{boardType.ptypename}</span>
          <span className="text-xs text-subtle-text-light dark:text-white/50">/{boardType.ptypeaddressName}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(boardType)}
          className="text-white/70 hover:text-white transition-colors"
          disabled={loading}
        >
          <span className="material-symbols-outlined text-xl">edit</span>
        </button>
        <button
          onClick={() => onDelete(boardType.ptypeid, boardType.ptypename)}
          className="text-primary hover:text-red-400 transition-colors"
          disabled={loading}
        >
          <span className="material-symbols-outlined text-xl">delete</span>
        </button>
      </div>
    </li>
  )
}

/**
 * 게시글 타입 관리 페이지 (ADMIN 전용)
 * - 게시글 타입 목록 조회
 * - 게시글 타입 추가/수정/삭제
 * - 드래그 앤 드롭으로 순서 변경
 * - 사이드바 + 메인 컨텐츠 레이아웃
 */
export default function BoardTypeManagement() {
  const {
    boardTypes,
    loading,
    error,
    fetchBoardTypes,
    addBoardType,
    updateBoardType,
    deleteBoardType,
    reorderBoardTypes,
    clearError
  } = useBoardTypeStore()

  // 폼 상태
  const [newTypeName, setNewTypeName] = useState('')
  const [newTypeAddress, setNewTypeAddress] = useState('')

  // 수정 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [editTypeName, setEditTypeName] = useState('')
  const [editTypeAddress, setEditTypeAddress] = useState('')



  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // 초기 로드
  useEffect(() => {
    fetchBoardTypes(true) // 강제 새로고침으로 최신 데이터 로드
  }, [])

  // 에러 발생 시 자동 clear (5초 후)
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  // 추가 핸들러
  const handleAdd = async (e) => {
    e.preventDefault()

    if (!newTypeName.trim() || !newTypeAddress.trim()) {
      alert('게시글 타입명과 URL 주소를 모두 입력해주세요.')
      return
    }

    try {
      await addBoardType({
        ptypename: newTypeName.trim(),
        ptypeaddressName: newTypeAddress.trim()
      })
      setNewTypeName('')
      setNewTypeAddress('')
      alert('게시글 타입이 추가되었습니다.')
    } catch (err) {
      alert(err.message || '게시글 타입 추가에 실패했습니다.')
    }
  }

  // 수정 모달 열기
  const openEditModal = (boardType) => {
    setEditingType(boardType)
    setEditTypeName(boardType.ptypename)
    setEditTypeAddress(boardType.ptypeaddressName)
    setIsEditModalOpen(true)
  }

  // 수정 모달 닫기
  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingType(null)
    setEditTypeName('')
    setEditTypeAddress('')
  }

  // 수정 핸들러
  const handleUpdate = async (e) => {
    e.preventDefault()

    if (!editTypeName.trim() || !editTypeAddress.trim()) {
      alert('게시글 타입명과 URL 주소를 모두 입력해주세요.')
      return
    }

    try {
      await updateBoardType(editingType.ptypeid, {
        ptypename: editTypeName.trim(),
        ptypeaddressName: editTypeAddress.trim()
      })
      closeEditModal()
      alert('게시글 타입이 수정되었습니다.')
    } catch (err) {
      alert(err.message || '게시글 타입 수정에 실패했습니다.')
    }
  }

  // 삭제 핸들러
  const handleDelete = async (id, typeName) => {
    if (!confirm(`"${typeName}" 게시글 타입을 삭제하시겠습니까?`)) {
      return
    }

    try {
      await deleteBoardType(id)
      alert('게시글 타입이 삭제되었습니다.')
    } catch (err) {
      alert(err.message || '게시글 타입 삭제에 실패했습니다.')
    }
  }

  // 드래그 앤 드롭 핸들러
  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = boardTypes.findIndex((item) => item.ptypeid === active.id)
    const newIndex = boardTypes.findIndex((item) => item.ptypeid === over.id)

    // 로컬에서 순서 변경 (UI 즉시 반영)
    const reorderedItems = arrayMove(boardTypes, oldIndex, newIndex)

    // orderMappings 생성: typeId는 불변, newOrder만 변경
    const orderMappings = reorderedItems.map((item, index) => ({
      typeId: item.ptypeid,
      newOrder: index + 1 // 1부터 시작하는 순서로 변경
    }))

    console.log('🔄 순서 변경:', {
      oldIndex,
      newIndex,
      reorderedItems: reorderedItems.map((item) => ({ id: item.ptypeid, name: item.ptypename })),
      orderMappings
    })

    try {
      // 백엔드에 displayOrder 재배정 요청
      await reorderBoardTypes(orderMappings)
      alert('게시글 타입 순서가 변경되었습니다.')
    } catch (err) {
      console.error('순서 변경 실패:', err)
      alert(err.message || '게시글 타입 순서 변경에 실패했습니다.')
      // 실패 시 다시 불러오기
      await fetchBoardTypes(true)
    }
  }

  return (
    <main className="p-8 bg-surface-light dark:bg-surface min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-8">게시글 타입 설정</h1>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500">
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                {error}
              </p>
            </div>
          )}

          {/* 로딩 상태 */}
          {loading && (
            <div className="mb-6 flex items-center justify-center gap-2 text-white/70">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              <span>처리 중...</span>
            </div>
          )}

          {/* 2열 그리드: 왼쪽 목록, 오른쪽 추가 폼 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 왼쪽: 게시글 타입 리스트 (드래그 앤 드롭 가능) */}
            <div className="bg-background-light/50 dark:bg-background-dark/50 rounded-lg border border-border-light p-6">
              <h2 className="text-xl font-semibold mb-4 text-text-light dark:text-text-dark">
                게시글 타입 리스트
                <span className="text-xs text-subtle-text-light dark:text-white/50 ml-2 font-normal">
                  (드래그로 순서 변경)
                </span>
              </h2>

              {boardTypes.length === 0 ? (
                <p className="text-subtle-text-light dark:text-white/60 text-center py-8">
                  등록된 게시글 타입이 없습니다.
                </p>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={boardTypes.map((item) => item.ptypeid)} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-3">
                      {boardTypes.map((boardType) => (
                        <SortableItem
                          key={boardType.ptypeid}
                          boardType={boardType}
                          onEdit={openEditModal}
                          onDelete={handleDelete}
                          loading={loading}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* 오른쪽: 새 게시글 타입 추가 폼 */}
            <div className="bg-background-light/50 dark:bg-background-dark/50 rounded-lg border border-border-light p-6">
              <h2 className="text-xl font-semibold mb-4 text-text-light dark:text-text-dark">새 게시글 타입 추가</h2>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label
                    htmlFor="post-type-name"
                    className="block text-sm font-medium text-subtle-text-light dark:text-white/80 mb-2"
                  >
                    게시글 타입명 (한글)
                  </label>
                  <input
                    id="post-type-name"
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="예: 프로모션"
                    className="w-full bg-surface-light dark:bg-background-light border border-border-light rounded-md px-4 py-2 text-text-light dark:text-white placeholder:text-subtle-text-light focus:ring-primary focus:border-primary"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="post-type-address"
                    className="block text-sm font-medium text-subtle-text-light dark:text-white/80 mb-2"
                  >
                    URL 주소 (영문)
                  </label>
                  <input
                    id="post-type-address"
                    type="text"
                    value={newTypeAddress}
                    onChange={(e) => setNewTypeAddress(e.target.value)}
                    placeholder="예: promotions"
                    className="w-full bg-surface-light dark:bg-background-light border border-border-light rounded-md px-4 py-2 text-text-light dark:text-white placeholder:text-subtle-text-light focus:ring-primary focus:border-primary"
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-subtle-text-light dark:text-white/50">
                    게시판 URL에 사용됩니다 (예: /board/promotions)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">add</span>
                  <span>추가하기</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 수정 모달 */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-surface-light dark:bg-surface rounded-lg shadow-xl w-full max-w-md border border-border-light">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">게시글 타입 수정</h3>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label
                      htmlFor="edit-post-type-name"
                      className="block text-sm font-medium text-subtle-text-light dark:text-white/80 mb-2"
                    >
                      게시글 타입명 (한글)
                    </label>
                    <input
                      id="edit-post-type-name"
                      type="text"
                      value={editTypeName}
                      onChange={(e) => setEditTypeName(e.target.value)}
                      className="w-full bg-surface-light dark:bg-background-light border border-border-light rounded-md px-4 py-2 text-text-light dark:text-white focus:ring-primary focus:border-primary"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-post-type-address"
                      className="block text-sm font-medium text-subtle-text-light dark:text-white/80 mb-2"
                    >
                      URL 주소 (영문)
                    </label>
                    <input
                      id="edit-post-type-address"
                      type="text"
                      value={editTypeAddress}
                      onChange={(e) => setEditTypeAddress(e.target.value)}
                      className="w-full bg-surface-light dark:bg-background-light border border-border-light rounded-md px-4 py-2 text-text-light dark:text-white focus:ring-primary focus:border-primary"
                      disabled={loading}
                    />
                    <p className="mt-1 text-xs text-subtle-text-light dark:text-white/50">
                      게시판 URL에 사용됩니다 (예: /board/{editTypeAddress})
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      disabled={loading}
                      className="px-4 py-2 rounded-md text-subtle-text-light dark:text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-primary text-white rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      저장
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
    </main>
  )
}
