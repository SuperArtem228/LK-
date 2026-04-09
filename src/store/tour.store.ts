import { create } from 'zustand'

const TOUR_TOTAL_STEPS = 11

interface TourState {
  active: boolean
  currentStep: number
  startTour: () => void
  endTour: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (n: number) => void
}

export const useTourStore = create<TourState>()((set, get) => ({
  active: false,
  currentStep: 0,

  startTour: () => set({ active: true, currentStep: 0 }),

  endTour: () => set({ active: false, currentStep: 0 }),

  nextStep: () => {
    const { currentStep } = get()
    if (currentStep >= TOUR_TOTAL_STEPS - 1) {
      set({ active: false, currentStep: 0 })
    } else {
      set({ currentStep: currentStep + 1 })
    }
  },

  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),

  goToStep: (n) => set({ currentStep: Math.max(0, Math.min(TOUR_TOTAL_STEPS - 1, n)) }),
}))
