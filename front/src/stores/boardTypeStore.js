// src/stores/boardTypeStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * BoardType Store
 * - 게시글 타입 목록 관리 (공지사항, 이벤트, 혜택 등)
 * - Navbar 동적 메뉴 생성용
 * - 관리자 페이지에서 CRUD 관리
 */
export const useBoardTypeStore = create(
  persist(
    (set, get) => ({
      // ===== State =====
      boardTypes: [],           // 게시글 타입 목록
      loading: false,           // 로딩 상태
      error: null,              // 에러 메시지
      lastFetched: null,        // 마지막 fetch 시간 (캐싱용)

      // ===== Actions =====

      /**
       * 게시글 타입 목록 가져오기
       * 10분 이내 재호출 시 캐시된 데이터 사용
       */
      fetchBoardTypes: async (forceRefresh = false) => {
        const state = get()
        const now = Date.now()
        const CACHE_TIME = 10 * 60 * 1000 // 10분

        console.log('🔍 [boardTypeStore] fetchBoardTypes 호출됨', { forceRefresh })

        // 캐시된 데이터가 있고 강제 새로고침이 아니면 캐시 사용
        if (!forceRefresh && state.boardTypes.length > 0 && state.lastFetched) {
          if (now - state.lastFetched < CACHE_TIME) {
            console.log('✅ [boardTypeStore] 캐시된 게시글 타입 데이터 사용:', state.boardTypes.length, '개')
            return state.boardTypes
          }
        }

        console.log('🔍 [boardTypeStore] API 요청 시작')
        set({ loading: true, error: null })

        try {
          const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
          const url = `${SERVER_ORIGIN}/api/board-types`

          console.log('🔍 [boardTypeStore] 요청 URL:', url)

          const response = await fetch(url)

          console.log('🔍 [boardTypeStore] 응답 상태:', response.status, response.statusText)

          if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ [boardTypeStore] 응답 에러:', errorText)
            throw new Error(`게시글 타입 목록 조회 실패: ${response.status} - ${errorText}`)
          }

          const data = await response.json()

          console.log('🔍 [boardTypeStore] 받은 데이터:', data)
          console.log('🔍 [boardTypeStore] 데이터 타입:', typeof data, 'isArray:', Array.isArray(data))
          
          // 각 아이템의 필드명 확인
          if (Array.isArray(data)) {
            data.forEach((item, index) => {
              console.log(`🔍 [boardTypeStore] 아이템 ${index}:`, item)
              console.log(`🔍 [boardTypeStore] 아이템 ${index} 필드:`, Object.keys(item))
            })
          }

          set({
            boardTypes: data,
            loading: false,
            error: null,
            lastFetched: now
          })

          console.log('✅ [boardTypeStore] 게시글 타입 로드 완료:', data.length, '개')
          return data
        } catch (error) {
          console.error('❌ [boardTypeStore] 게시글 타입 조회 에러:', error)
          console.error('❌ [boardTypeStore] 에러 상세:', error.message, error.stack)
          set({
            loading: false,
            error: error.message || '게시글 타입을 불러오는데 실패했습니다.'
          })
          return []
        }
      },

      /**
       * 게시글 타입 추가 (관리자 전용)
       */
      addBoardType: async (boardType) => {
        console.log('🔍 [boardTypeStore] addBoardType 호출:', boardType)
        set({ loading: true, error: null })

        try {
          const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
          const token = localStorage.getItem('jwt')

          const response = await fetch(`${SERVER_ORIGIN}/api/board-types`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(boardType)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`게시글 타입 추가 실패: ${response.status} - ${errorText}`)
          }

          const newBoardType = await response.json()
          console.log('✅ [boardTypeStore] 게시글 타입 추가 완료:', newBoardType)

          // 목록 갱신
          await get().fetchBoardTypes(true)
          set({ loading: false })
          return newBoardType
        } catch (error) {
          console.error('❌ [boardTypeStore] 게시글 타입 추가 에러:', error)
          set({
            loading: false,
            error: error.message || '게시글 타입 추가에 실패했습니다.'
          })
          throw error
        }
      },

      /**
       * 게시글 타입 수정 (관리자 전용)
       */
      updateBoardType: async (id, boardType) => {
        console.log('🔍 [boardTypeStore] updateBoardType 호출:', id, boardType)
        set({ loading: true, error: null })

        try {
          const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
          const token = localStorage.getItem('jwt')

          const response = await fetch(`${SERVER_ORIGIN}/api/board-types/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(boardType)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`게시글 타입 수정 실패: ${response.status} - ${errorText}`)
          }

          const updatedBoardType = await response.json()
          console.log('✅ [boardTypeStore] 게시글 타입 수정 완료:', updatedBoardType)

          // 목록 갱신
          await get().fetchBoardTypes(true)
          set({ loading: false })
          return updatedBoardType
        } catch (error) {
          console.error('❌ [boardTypeStore] 게시글 타입 수정 에러:', error)
          set({
            loading: false,
            error: error.message || '게시글 타입 수정에 실패했습니다.'
          })
          throw error
        }
      },

      /**
       * 게시글 타입 삭제 (관리자 전용)
       */
      deleteBoardType: async (id) => {
        console.log('🔍 [boardTypeStore] deleteBoardType 호출:', id)
        set({ loading: true, error: null })

        try {
          const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
          const token = localStorage.getItem('jwt')

          const response = await fetch(`${SERVER_ORIGIN}/api/board-types/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`게시글 타입 삭제 실패: ${response.status} - ${errorText}`)
          }

          console.log('✅ [boardTypeStore] 게시글 타입 삭제 완료')

          // 목록 갱신
          await get().fetchBoardTypes(true)
          set({ loading: false })
        } catch (error) {
          console.error('❌ [boardTypeStore] 게시글 타입 삭제 에러:', error)
          set({
            loading: false,
            error: error.message || '게시글 타입 삭제에 실패했습니다.'
          })
          throw error
        }
      },

      /**
       * 게시글 타입 순서 재배정 (관리자 전용)
       * 드래그 앤 드롭으로 순서 변경 시 displayOrder만 변경 (ID는 불변)
       */
      reorderBoardTypes: async (orderMappings) => {
        console.log('🔍 [boardTypeStore] reorderBoardTypes 호출:', orderMappings)
        set({ loading: true, error: null })

        try {
          const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
          const token = localStorage.getItem('jwt')

          const response = await fetch(`${SERVER_ORIGIN}/api/board-types/reorder`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ orderMappings })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`게시글 타입 순서 재배정 실패: ${response.status} - ${errorText}`)
          }

          const reorderedTypes = await response.json()
          console.log('✅ [boardTypeStore] 게시글 타입 순서 재배정 완료:', reorderedTypes)

          // 목록 갱신
          await get().fetchBoardTypes(true)
          set({ loading: false })
          return reorderedTypes
        } catch (error) {
          console.error('❌ [boardTypeStore] 게시글 타입 순서 재배정 에러:', error)
          set({
            loading: false,
            error: error.message || '게시글 타입 순서 재배정에 실패했습니다.'
          })
          throw error
        }
      },

      /**
       * 에러 메시지 초기화
       */
      clearError: () => {
        set({ error: null })
      },

      /**
       * 전체 스토어 초기화
       */
      reset: () => {
        set({
          boardTypes: [],
          loading: false,
          error: null,
          lastFetched: null
        })
        console.log('✅ BoardType Store 초기화')
      }
    }),
    {
      name: 'board-type-store',
      // 캐싱을 위해 전체 persist
      partialize: (state) => ({
        boardTypes: state.boardTypes,
        lastFetched: state.lastFetched
      })
    }
  )
)

/**
 * 앱 시작 시 게시글 타입 미리 로드 (선택사항)
 */
export function initBoardTypeStore() {
  const { fetchBoardTypes } = useBoardTypeStore.getState()
  fetchBoardTypes().catch(console.error)
}
