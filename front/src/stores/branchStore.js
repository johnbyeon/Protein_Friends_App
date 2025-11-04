// src/stores/branchStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Branch Store
 * - 전체 지점 목록 관리
 * - 선택된 지점 관리 (유저, 트레이너 모두 사용)
 * - API 호출 및 캐싱
 */
export const useBranchStore = create(
  persist(
    (set, get) => ({
      // ===== State =====
      branches: [],              // 전체 지점 목록
      selectedBranch: null,      // 현재 선택된 지점
      loading: false,            // 로딩 상태
      error: null,               // 에러 메시지
      lastFetched: null,         // 마지막 fetch 시간 (캐싱용)

      // ===== Actions =====

      /**
       * 지점 목록 가져오기 (API 호출)
       * 5분 이내 재호출 시 캐시된 데이터 사용
       */
      fetchBranches: async (forceRefresh = false) => {
        const state = get()
        const now = Date.now()
        const CACHE_TIME = 5 * 60 * 1000 // 5분

        console.log('🔍 [branchStore] fetchBranches 호출됨', { forceRefresh })

        // 캐시된 데이터가 있고 강제 새로고침이 아니면 캐시 사용
        if (!forceRefresh && state.branches.length > 0 && state.lastFetched) {
          if (now - state.lastFetched < CACHE_TIME) {
            console.log('✅ [branchStore] 캐시된 지점 데이터 사용:', state.branches.length, '개')
            return state.branches
          }
        }

        console.log('🔍 [branchStore] API 요청 시작')
        set({ loading: true, error: null })

        try {
          const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
          const url = `${SERVER_ORIGIN}/api/branches`

          console.log('🔍 [branchStore] 요청 URL:', url)
          console.log('🔍 [branchStore] SERVER_ORIGIN:', SERVER_ORIGIN)

          const response = await fetch(url)

          console.log('🔍 [branchStore] 응답 상태:', response.status, response.statusText)

          if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ [branchStore] 응답 에러:', errorText)
            throw new Error(`지점 목록 조회 실패: ${response.status} - ${errorText}`)
          }

          const data = await response.json()

          console.log('🔍 [branchStore] 받은 데이터:', data)
          console.log('🔍 [branchStore] 데이터 타입:', typeof data, 'isArray:', Array.isArray(data))

          set({
            branches: data,
            loading: false,
            error: null,
            lastFetched: now
          })

          console.log('✅ [branchStore] 지점 목록 로드 완료:', data.length, '개')
          return data
        } catch (error) {
          console.error('❌ [branchStore] 지점 목록 조회 에러:', error)
          console.error('❌ [branchStore] 에러 상세:', error.message, error.stack)
          set({
            loading: false,
            error: error.message || '지점 목록을 불러오는데 실패했습니다.'
          })
          return []
        }
      },

      /**
       * 특정 지점 상세 정보 가져오기
       */
      fetchBranchDetail: async (branchId) => {
        set({ loading: true, error: null })

        try {
          const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
          const response = await fetch(`${SERVER_ORIGIN}/api/branches/${branchId}`)

          if (!response.ok) {
            throw new Error(`지점 상세 조회 실패: ${response.status}`)
          }

          const data = await response.json()
          console.log('✅ 지점 상세 정보 로드:', data)

          set({ loading: false, error: null })
          return data
        } catch (error) {
          console.error('❌ 지점 상세 조회 에러:', error)
          set({
            loading: false,
            error: error.message || '지점 정보를 불러오는데 실패했습니다.'
          })
          return null
        }
      },

      /**
       * 지점별 트레이너 목록 가져오기
       */
      fetchBranchTrainers: async (branchId) => {
        try {
          const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || ''
          const response = await fetch(`${SERVER_ORIGIN}/api/branches/${branchId}/trainers`)

          if (!response.ok) {
            throw new Error(`트레이너 목록 조회 실패: ${response.status}`)
          }

          const data = await response.json()
          console.log('✅ 트레이너 목록 로드:', data.length, '명')
          return data
        } catch (error) {
          console.error('❌ 트레이너 목록 조회 에러:', error)
          return []
        }
      },

      /**
       * 지점 선택
       */
      selectBranch: (branch) => {
        set({ selectedBranch: branch })
        console.log('✅ 지점 선택:', branch?.gName)
      },

      /**
       * 지점 선택 해제
       */
      clearSelectedBranch: () => {
        set({ selectedBranch: null })
        console.log('✅ 지점 선택 해제')
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
          branches: [],
          selectedBranch: null,
          loading: false,
          error: null,
          lastFetched: null
        })
        console.log('✅ Branch Store 초기화')
      }
    }),
    {
      name: 'branch-store',
      // selectedBranch만 persist (branches는 매번 새로 fetch)
      partialize: (state) => ({
        selectedBranch: state.selectedBranch
      })
    }
  )
)

/**
 * 앱 시작 시 지점 목록 미리 로드 (선택사항)
 */
export function initBranchStore() {
  const { fetchBranches } = useBranchStore.getState()
  fetchBranches().catch(console.error)
}
