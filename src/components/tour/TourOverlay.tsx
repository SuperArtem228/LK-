'use client'

import { useEffect, useState, useCallback } from 'react'
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
const TOOLTIP_WIDTH = 320
const MOBILE_BREAKPOINT = 768

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
  const [isMobile, setIsMobile] = useState(false)

  // Track mobile breakpoint
  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const findAndSetTarget = useCallback(() => {
    if (!step) return
    const el = document.querySelector(`[data-tour-id="${step.targetId}"]`)
    if (!el) {
      setTargetRect(null)
      return
    }
    // Scroll into view first, then measure after a frame
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      setTargetRect({
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      })
    })
  }, [step])

  // Navigate to the correct route for this step
  useEffect(() => {
    if (!active || !step) return
    if (pathname !== step.route) {
      setNavigating(true)
      setTargetRect(null)
      router.push(step.route)
    } else {
      setNavigating(false)
    }
  }, [active, step, pathname, router])

  // Find target element after navigation completes
  useEffect(() => {
    if (!active || navigating) return
    // Longer delay to let page render fully (especially on mobile)
    const t = setTimeout(findAndSetTarget, 300)
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
    let ticking = false
    const handler = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          findAndSetTarget()
          ticking = false
        })
      }
    }
    window.addEventListener('resize', handler)
    window.addEventListener('scroll', handler, true)
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('scroll', handler, true)
    }
  }, [active, findAndSetTarget])

  if (!active || !step) return null

  // --- Mobile: always bottom sheet ---
  // --- Desktop: positioned relative to target ---
  function getTooltipStyle(): React.CSSProperties {
    if (isMobile) {
      // Bottom sheet on mobile — always visible, always full width
      return {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 110,
        maxHeight: '60vh',
      }
    }

    // Desktop positioning
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

    // On desktop, try positioning per step config, but fallback to bottom if no space
    let top: number | undefined
    let bottom: number | undefined
    let left: number | undefined
    let right: number | undefined

    if (step.position === 'bottom') {
      top = targetRect.top + targetRect.height + gap
      left = Math.max(12, Math.min(targetRect.left, vw - TOOLTIP_WIDTH - 12))
    } else if (step.position === 'top') {
      bottom = vh - targetRect.top + gap
      left = Math.max(12, Math.min(targetRect.left, vw - TOOLTIP_WIDTH - 12))
    } else if (step.position === 'right') {
      top = Math.max(12, Math.min(targetRect.top, vh - 260))
      left = targetRect.left + targetRect.width + gap
      if (left + TOOLTIP_WIDTH > vw - 12) {
        // Fallback: position below
        top = targetRect.top + targetRect.height + gap
        left = Math.max(12, Math.min(targetRect.left, vw - TOOLTIP_WIDTH - 12))
      }
    } else if (step.position === 'left') {
      top = Math.max(12, Math.min(targetRect.top, vh - 260))
      right = vw - targetRect.left + gap
      if (right + TOOLTIP_WIDTH > vw - 12) {
        // Fallback: position below
        top = targetRect.top + targetRect.height + gap
        right = undefined
        left = Math.max(12, Math.min(targetRect.left, vw - TOOLTIP_WIDTH - 12))
      }
    }

    // Final clamp
    if (top !== undefined) top = Math.max(12, Math.min(top, vh - 260))
    if (left !== undefined) left = Math.max(12, left)
    if (right !== undefined) right = Math.max(12, right)

    return {
      position: 'fixed',
      top,
      bottom,
      left,
      right,
      width: TOOLTIP_WIDTH,
      zIndex: 110,
    }
  }

  // Spotlight — only show if target found and not navigating
  const showSpotlight = targetRect && !navigating
  const spotlightStyle: React.CSSProperties = showSpotlight
    ? {
        position: 'fixed',
        top: targetRect.top,
        left: targetRect.left,
        width: targetRect.width,
        height: Math.min(targetRect.height, isMobile ? window.innerHeight * 0.5 : targetRect.height),
        zIndex: 102,
        borderRadius: 10,
        boxShadow: '0 0 0 9999px rgba(9,9,11,0.6)',
        pointerEvents: 'none' as const,
      }
    : {
        position: 'fixed' as const,
        inset: 0,
        zIndex: 102,
        backgroundColor: 'rgba(9,9,11,0.6)',
        pointerEvents: 'none' as const,
      }

  const isFirst = currentStep === 0
  const isLast = currentStep === TOUR_STEPS.length - 1

  return (
    <>
      {/* Backdrop — blocks interaction outside tooltip */}
      <div
        className="fixed inset-0 z-[100]"
        onClick={endTour}
      />

      {/* Spotlight (box-shadow cutout) */}
      <div style={spotlightStyle} />

      {/* Highlight ring */}
      {showSpotlight && (
        <div
          style={{
            position: 'fixed',
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: Math.min(targetRect.height, isMobile ? window.innerHeight * 0.5 : targetRect.height),
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
        className={cn(
          'bg-white shadow-2xl border border-zinc-100 overflow-hidden',
          isMobile
            ? 'rounded-t-2xl border-b-0 pb-[env(safe-area-inset-bottom)]'
            : 'rounded-xl animate-fade-in'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-zinc-200" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-2">
          <h3 className="text-base font-semibold text-zinc-900 leading-snug pr-3">{step.title}</h3>
          <button
            onClick={endTour}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors flex-shrink-0"
            aria-label="Закрыть тур"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <p className="px-5 pb-4 text-sm text-zinc-500 leading-relaxed">{step.body}</p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 pb-3 px-5">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-full transition-all duration-200',
                i === currentStep ? 'w-5 h-1.5 bg-indigo-600' : 'w-1.5 h-1.5 bg-zinc-200'
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-5 pb-5 pt-2 border-t border-zinc-100">
          <button
            onClick={prevStep}
            disabled={isFirst}
            className={cn(
              'flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors',
              isFirst
                ? 'text-zinc-300 cursor-default'
                : 'text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Назад
          </button>

          <span className="text-sm text-zinc-400 tabular-nums">
            {currentStep + 1} / {TOUR_STEPS.length}
          </span>

          <button
            onClick={nextStep}
            className="flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          >
            {isLast ? 'Готово' : 'Далее'}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Loading indicator when navigating */}
      {navigating && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[120] bg-white rounded-xl shadow-xl px-6 py-4 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-zinc-700">Загрузка...</span>
        </div>
      )}
    </>
  )
}
