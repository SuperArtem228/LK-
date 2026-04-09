'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTourStore } from '@/store/tour.store'
import { TOUR_STEPS } from '@/lib/demo/tour'
import { cn } from '@/lib/utils/cn'

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

const PADDING = 8
const TOOLTIP_WIDTH = 300
const TOOLTIP_MAX_HEIGHT = 220

export function TourOverlay() {
  const active = useTourStore((s) => s.active)
  const currentStep = useTourStore((s) => s.currentStep)
  const endTour = useTourStore((s) => s.endTour)
  const nextStep = useTourStore((s) => s.nextStep)
  const prevStep = useTourStore((s) => s.prevStep)

  const router = useRouter()
  const pathname = usePathname()

  const step = TOUR_STEPS[currentStep]
  const [targetRect, setTargetRect] = useState<Rect | null>(null)
  const [navigating, setNavigating] = useState(false)
  const scrollParentRef = useRef<Element | null>(null)

  const findAndSetTarget = useCallback(() => {
    if (!step) return
    const el = document.querySelector(`[data-tour-id="${step.targetId}"]`)
    if (!el) {
      setTargetRect(null)
      return
    }
    const rect = el.getBoundingClientRect()
    setTargetRect({
      top: rect.top - PADDING,
      left: rect.left - PADDING,
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
    })
    // Scroll target into view if needed
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [step])

  // Navigate to the correct route for this step
  useEffect(() => {
    if (!active || !step) return
    if (pathname !== step.route) {
      setNavigating(true)
      router.push(step.route)
    } else {
      setNavigating(false)
    }
  }, [active, step, pathname, router])

  // Find target element after navigation completes
  useEffect(() => {
    if (!active || navigating) return
    // Small delay for DOM to settle after route change
    const t = setTimeout(findAndSetTarget, 100)
    return () => clearTimeout(t)
  }, [active, navigating, findAndSetTarget, currentStep])

  useEffect(() => {
    if (pathname === step?.route) {
      setNavigating(false)
    }
  }, [pathname, step])

  // Keyboard navigation
  useEffect(() => {
    if (!active) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') endTour()
      if (e.key === 'ArrowRight') nextStep()
      if (e.key === 'ArrowLeft') prevStep()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active, endTour, nextStep, prevStep])

  // Recompute on resize/scroll
  useEffect(() => {
    if (!active) return
    const handler = () => findAndSetTarget()
    window.addEventListener('resize', handler)
    window.addEventListener('scroll', handler, true)
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('scroll', handler, true)
    }
  }, [active, findAndSetTarget])

  if (!active || !step) return null

  // Compute tooltip position
  function getTooltipStyle(): React.CSSProperties {
    if (!targetRect || step.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: TOOLTIP_WIDTH,
        zIndex: 110,
      }
    }

    const vw = window.innerWidth
    const vh = window.innerHeight
    const gap = 16

    let top: number | undefined
    let bottom: number | undefined
    let left: number | undefined
    let right: number | undefined

    if (step.position === 'bottom') {
      top = targetRect.top + targetRect.height + gap
      left = Math.min(targetRect.left, vw - TOOLTIP_WIDTH - 12)
    } else if (step.position === 'top') {
      bottom = vh - targetRect.top + gap
      left = Math.min(targetRect.left, vw - TOOLTIP_WIDTH - 12)
    } else if (step.position === 'right') {
      top = Math.min(targetRect.top, vh - TOOLTIP_MAX_HEIGHT - 12)
      left = targetRect.left + targetRect.width + gap
      // If not enough space on right, fallback to left
      if (left + TOOLTIP_WIDTH > vw) {
        left = undefined
        right = vw - targetRect.left + gap
      }
    } else if (step.position === 'left') {
      top = Math.min(targetRect.top, vh - TOOLTIP_MAX_HEIGHT - 12)
      right = vw - targetRect.left + gap
      if (right + TOOLTIP_WIDTH > vw) {
        right = undefined
        left = targetRect.left + targetRect.width + gap
      }
    }

    // Clamp top to viewport
    if (top !== undefined) top = Math.max(12, Math.min(top, vh - TOOLTIP_MAX_HEIGHT - 12))
    if (left !== undefined) left = Math.max(12, left)
    if (right !== undefined) right = Math.max(12, right)

    return {
      position: 'fixed',
      top,
      bottom,
      left,
      right,
      width: Math.min(TOOLTIP_WIDTH, vw - 24),
      zIndex: 110,
    }
  }

  const spotlightStyle: React.CSSProperties = targetRect
    ? {
        position: 'fixed',
        top: targetRect.top,
        left: targetRect.left,
        width: targetRect.width,
        height: targetRect.height,
        zIndex: 102,
        borderRadius: 10,
        boxShadow: '0 0 0 9999px rgba(9,9,11,0.65)',
        pointerEvents: 'none',
      }
    : {
        position: 'fixed',
        inset: 0,
        zIndex: 102,
        backgroundColor: 'rgba(9,9,11,0.65)',
        pointerEvents: 'none',
      }

  const isFirst = currentStep === 0
  const isLast = currentStep === TOUR_STEPS.length - 1

  return (
    <>
      {/* Backdrop — blocks interaction outside tooltip/target */}
      <div
        className="fixed inset-0 z-[100]"
        style={{ pointerEvents: navigating ? 'auto' : 'auto' }}
        onClick={endTour}
      />

      {/* Spotlight (box-shadow cutout) */}
      <div style={spotlightStyle} />

      {/* Highlight ring around target */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            zIndex: 103,
            borderRadius: 10,
            border: '2px solid #818cf8',
            pointerEvents: 'none',
            boxSizing: 'border-box',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        style={getTooltipStyle()}
        className="bg-white rounded-xl shadow-2xl border border-zinc-100 overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-zinc-900 leading-snug pr-2">{step.title}</h3>
          <button
            onClick={endTour}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors flex-shrink-0"
            aria-label="Закрыть тур"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <p className="px-4 pb-4 text-sm text-zinc-500 leading-relaxed">{step.body}</p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-full transition-all duration-200',
                i === currentStep ? 'w-4 h-1.5 bg-indigo-600' : 'w-1.5 h-1.5 bg-zinc-200'
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-4 pb-4 pt-1 border-t border-zinc-50">
          <button
            onClick={prevStep}
            disabled={isFirst}
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors',
              isFirst
                ? 'text-zinc-300 cursor-default'
                : 'text-zinc-600 hover:bg-zinc-100'
            )}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Назад
          </button>

          <span className="text-xs text-zinc-400">
            {currentStep + 1} / {TOUR_STEPS.length}
          </span>

          <button
            onClick={nextStep}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            {isLast ? 'Готово' : 'Далее'}
            {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Loading indicator when navigating */}
      {navigating && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[120] bg-white rounded-xl shadow-xl px-6 py-4 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-zinc-700">Переходим к следующему шагу...</span>
        </div>
      )}
    </>
  )
}
