'use client'

import { Play } from 'lucide-react'
import { useTourStore } from '@/store/tour.store'

export function TourStartButton() {
  const active = useTourStore((s) => s.active)
  const startTour = useTourStore((s) => s.startTour)

  if (active) return null

  return (
    <button
      onClick={startTour}
      className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
      aria-label="Начать тур по продукту"
    >
      <Play className="w-4 h-4" />
      <span className="hidden sm:inline">Показать тур</span>
    </button>
  )
}
