'use client'
import { create } from 'zustand'
import type { DashboardPeriod } from '@/lib/types'

interface DashboardState {
  period: DashboardPeriod
  setPeriod: (period: DashboardPeriod) => void
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  period: '7d',
  setPeriod: (period) => set({ period }),
}))
