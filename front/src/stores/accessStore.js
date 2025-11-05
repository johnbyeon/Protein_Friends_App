import { create } from 'zustand'

export const useAccessStore = create((set) => ({
  isCheckedIn: false,
  selectedGymId: null,
  checkedInLocation: '',
  setAccessState: (state) => set(state),
  resetAccess: () => set({
    isCheckedIn: false,
    selectedGymId: null,
    checkedInLocation: '',
  }),
}))
