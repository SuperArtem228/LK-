'use client'
import { create } from 'zustand'
import type { VacancyCollection, WorkFormat } from '@/lib/types'

interface JobsFilters {
  collection: VacancyCollection | 'all'
  format: WorkFormat | 'all'
  minMatch: number
  minSalary: number
  search: string
}

interface JobsState {
  filters: JobsFilters
  selectedJobId: string | null

  setFilter: <K extends keyof JobsFilters>(key: K, value: JobsFilters[K]) => void
  resetFilters: () => void
  selectJob: (id: string | null) => void
}

const defaultFilters: JobsFilters = {
  collection: 'all',
  format: 'all',
  minMatch: 0,
  minSalary: 0,
  search: '',
}

export const useJobsStore = create<JobsState>()((set) => ({
  filters: defaultFilters,
  selectedJobId: null,

  setFilter: (key, value) => {
    set((state) => ({ filters: { ...state.filters, [key]: value } }))
  },

  resetFilters: () => set({ filters: defaultFilters }),

  selectJob: (id) => set({ selectedJobId: id }),
}))
