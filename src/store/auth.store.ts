'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, ScenarioId, OnboardingStep } from '@/lib/types'
import { DEFAULT_SCENARIO_ID } from '@/lib/demo/scenarios'

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  onboardingComplete: boolean
  hhConnected: boolean
  scenarioId: ScenarioId

  login: (scenarioId?: ScenarioId) => void
  logout: () => void
  setUser: (user: Partial<User>) => void
  setOnboardingStep: (step: OnboardingStep) => void
  completeOnboarding: () => void
  connectHH: () => void
  setScenario: (id: ScenarioId) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      onboardingComplete: false,
      hhConnected: false,
      scenarioId: DEFAULT_SCENARIO_ID,

      login: (scenarioId = DEFAULT_SCENARIO_ID) => {
        set({
          isLoggedIn: true,
          scenarioId,
          onboardingComplete: false,
          hhConnected: false,
        })
        if (typeof document !== 'undefined') {
          document.cookie = 'hhlab-session=1; path=/; max-age=86400; SameSite=Lax'
        }
      },

      logout: () => {
        set({
          user: null,
          isLoggedIn: false,
          onboardingComplete: false,
          hhConnected: false,
        })
        if (typeof document !== 'undefined') {
          document.cookie = 'hhlab-session=; path=/; max-age=0'
        }
      },

      setUser: (partial) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        }))
      },

      setOnboardingStep: (step) => {
        set((state) => ({
          user: state.user ? { ...state.user, onboardingStep: step } : null,
        }))
      },

      completeOnboarding: () => {
        set({ onboardingComplete: true })
        set((state) => ({
          user: state.user ? { ...state.user, onboardingStep: 'complete' } : null,
        }))
      },

      connectHH: () => {
        set({ hhConnected: true })
        set((state) => ({
          user: state.user ? { ...state.user, hhConnected: true } : null,
        }))
      },

      setScenario: (id) => {
        set({ scenarioId: id })
      },
    }),
    {
      name: 'hhlab-auth',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        onboardingComplete: state.onboardingComplete,
        hhConnected: state.hhConnected,
        scenarioId: state.scenarioId,
      }),
    }
  )
)
