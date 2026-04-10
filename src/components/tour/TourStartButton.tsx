'use client'

import { Play } from 'lucide-react'
import { useTourStore } from '@/store/tour.store'

export function TourStartButton() {
  const active = useTourStore((s) => s.active)
  const startTour = useTourStore((s) => s.startTour)

  if (active) return null

  return (
    <>
      {/* Desktop: bottom-right FAB */}
      <div className="hidden md:block fixed bottom-8 right-8 z-50">
        <div className="relative">
          {/* Glow rings */}
          <span className="absolute inset-0 rounded-2xl bg-lime-500 animate-ping opacity-20" />
          <span className="absolute inset-0 rounded-2xl bg-lime-400 animate-ping opacity-10 animation-delay-300" />

          <button
            onClick={startTour}
            className="relative flex items-center gap-3 bg-lime-600 hover:bg-lime-700 active:bg-lime-800 text-white px-5 py-3.5 rounded-2xl shadow-lg shadow-lime-600/30 transition-all duration-200 hover:scale-[1.03] hover:shadow-xl hover:shadow-lime-600/40"
          >
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Play className="w-3.5 h-3.5 fill-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold leading-tight">Показать тур</p>
              <p className="text-[11px] text-lime-200 leading-tight">2 минуты · 11 шагов</p>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile: sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-3 bg-gradient-to-t from-zinc-50 via-zinc-50/95 to-transparent pointer-events-none">
        <button
          onClick={startTour}
          className="pointer-events-auto w-full flex items-center justify-center gap-2.5 bg-lime-600 hover:bg-lime-700 active:bg-lime-800 text-white py-3.5 rounded-2xl shadow-lg shadow-lime-600/30 transition-colors"
        >
          <Play className="w-4 h-4 fill-white" />
          <span className="text-sm font-semibold">Начать интерактивный тур</span>
        </button>
      </div>
    </>
  )
}
