'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTourStore } from '@/store/tour.store'
import { TOUR_STEPS } from '@/lib/demo/tour'
import { cn } from '@/lib/utils/cn'

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
}

const SPOTLIGHT_PADDING = 6
const TOOLTIP_WIDTH = 320
const MOBILE_BREAKPOINT = 768
// Approximate bottom sheet height + gap so we scroll element above it
const MOBILE_SHEET_HEIGHT = 260

function getIsMobile() {
  return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
}

export function TourOverlay() {
  const active = useTourStore((s) => s.active)
  const currentStep = useTourStore((s) => s.currentStep)
  const endTour = useTourStore((s) => s.endTour)
  const nextStep = useTourStore((s) => s.nextStep)
  const prevStep = useTourStore((s) => s.prevStep)

  const router = useRouter()
  const pathname = usePathname()

  const step = TOUR_STEPS[currentStep]
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
  const [navigating, setNavigating] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(getIsMobile())
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const measureTarget = useCallback(() => {
    if (!step) return
    const el = document.querySelector(`[data-tour-id="${step.targetId}"]`)
    if (!el) {
      setTargetRect(null)
      return
    }

    const mobile = getIsMobile()

    // Instant scroll — predictable, no timing issues
    el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'center' })

    // On mobile: push element up so it sits above the bottom sheet
    if (mobile) {
      const r = el.getBoundingClientRect()
      const safeBottom = window.innerHeight - MOBILE_SHEET_HEIGHT - 24
      if (r.bottom > safeBottom) {
        const scrollUp = r.bottom - safeBottom
        const scrollable = getScrollParent(el)
        if (scrollable && scrollable !== document.documentElement) {
          scrollable.scrollTop += scrollUp
        } else {
          window.scrollBy({ top: scrollUp, behavior: 'instant' as ScrollBehavior })
        }
      }
    }

    // Measure after layout settles
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      setTargetRect({
        top: rect.top - SPOTLIGHT_PADDING,
        left: rect.left - SPOTLIGHT_PADDING,
        width: rect.width + SPOTLIGHT_PADDING * 2,
        height: rect.height + SPOTLIGHT_PADDING * 2,
      })
    })
  }, [step])

  // Navigate to correct route when step changes
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

  // Measure once navigation is done (300ms lets page render)
  useEffect(() => {
    if (!active || navigating) return
    const t = setTimeout(measureTarget, 300)
    return () => clearTimeout(t)
  }, [active, navigating, measureTarget, currentStep])

  // Detect navigation completion
  useEffect(() => {
    if (pathname === step?.route) setNavigating(false)
  }, [pathname, step])

  // Keyboard nav
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') endTour()
      if (e.key === 'ArrowRight') nextStep()
      if (e.key === 'ArrowLeft') prevStep()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active, endTour, nextStep, prevStep])

  // Re-measure on scroll/resize
  useEffect(() => {
    if (!active) return
    let frame: number
    const handler = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measureTarget)
    }
    window.addEventListener('resize', handler)
    window.addEventListener('scroll', handler, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', handler)
      window.removeEventListener('scroll', handler, true)
    }
  }, [active, measureTarget])

  if (!active || !step) return null

  const isFirst = currentStep === 0
  const isLast = currentStep === TOUR_STEPS.length - 1
  const showHighlight = !!targetRect && !navigating

  // ── Spotlight via box-shadow cutout ──────────────────────────────────────
  const backdropStyle: React.CSSProperties = showHighlight
    ? {
        position: 'fixed',
        top: targetRect.top,
        left: targetRect.left,
        width: targetRect.width,
        height: targetRect.height,
        zIndex: 102,
        borderRadius: 10,
        boxShadow: '0 0 0 9999px rgba(9,9,11,0.62)',
        pointerEvents: 'none',
      }
    : {
        position: 'fixed',
        inset: 0,
        zIndex: 102,
        backgroundColor: 'rgba(9,9,11,0.62)',
        pointerEvents: 'none',
      }

  // ── Tooltip positioning (desktop only — mobile uses bottom sheet) ─────────
  function getDesktopStyle(): React.CSSProperties {
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
    const maxH = 280

    let top: number | undefined
    let bottom: number | undefined
    let left: number | undefined
    let right: number | undefined

    if (step.position === 'bottom') {
      top = targetRect.top + targetRect.height + gap
      left = clamp(targetRect.left, 12, vw - TOOLTIP_WIDTH - 12)
    } else if (step.position === 'top') {
      bottom = vh - targetRect.top + gap
      left = clamp(targetRect.left, 12, vw - TOOLTIP_WIDTH - 12)
    } else if (step.position === 'right') {
      const tryLeft = targetRect.left + targetRect.width + gap
      if (tryLeft + TOOLTIP_WIDTH <= vw - 12) {
        top = clamp(targetRect.top, 12, vh - maxH)
        left = tryLeft
      } else {
        // fallback: below
        top = targetRect.top + targetRect.height + gap
        left = clamp(targetRect.left, 12, vw - TOOLTIP_WIDTH - 12)
      }
    } else if (step.position === 'left') {
      const tryRight = vw - targetRect.left + gap
      if (tryRight + TOOLTIP_WIDTH <= vw - 12) {
        top = clamp(targetRect.top, 12, vh - maxH)
        right = tryRight
      } else {
        // fallback: below
        top = targetRect.top + targetRect.height + gap
        left = clamp(targetRect.left, 12, vw - TOOLTIP_WIDTH - 12)
      }
    }

    if (top !== undefined) top = clamp(top, 12, vh - maxH)
    if (left !== undefined) left = clamp(left, 12, vw - TOOLTIP_WIDTH - 12)

    return { position: 'fixed', top, bottom, left, right, width: TOOLTIP_WIDTH, zIndex: 110 }
  }

  return (
    <>
      {/* Click-blocker behind everything — clicking outside tooltip ends tour */}
      <div className="fixed inset-0 z-[100]" onClick={endTour} />

      {/* Spotlight / full backdrop */}
      <div style={backdropStyle} />

      {/* Highlight ring */}
      {showHighlight && (
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

      {/* ── Mobile: bottom sheet ──────────────────────────────────────── */}
      {isMobile && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[110] bg-white rounded-t-2xl shadow-2xl border-t border-zinc-100"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-zinc-200" />
          </div>

          {/* Step label */}
          <div className="px-5 pb-1">
            <span className="text-xs font-medium text-lime-600">
              Шаг {currentStep + 1} из {TOUR_STEPS.length}
            </span>
          </div>

          {/* Title */}
          <div className="flex items-start justify-between px-5 pb-1">
            <h3 className="text-base font-semibold text-zinc-900 leading-snug flex-1 pr-3">
              {step.title}
            </h3>
            <button
              onClick={endTour}
              className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 active:bg-zinc-200 flex-shrink-0 -mr-1"
              aria-label="Закрыть тур"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <p className="px-5 pb-4 text-sm text-zinc-500 leading-relaxed">{step.body}</p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 pb-3">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full transition-all duration-200',
                  i === currentStep ? 'w-5 h-1.5 bg-lime-600' : 'w-1.5 h-1.5 bg-zinc-200'
                )}
              />
            ))}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-3 px-5 pb-4 pt-1 border-t border-zinc-100">
            <button
              onClick={prevStep}
              disabled={isFirst}
              className={cn(
                'flex items-center justify-center gap-1 flex-1 py-3 rounded-xl text-sm font-medium transition-colors border',
                isFirst
                  ? 'text-zinc-300 border-zinc-100 cursor-default'
                  : 'text-zinc-700 border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Назад
            </button>
            <button
              onClick={nextStep}
              className="flex items-center justify-center gap-1 flex-1 py-3 rounded-xl text-sm font-semibold bg-lime-600 text-white hover:bg-lime-700 active:bg-lime-800 transition-colors"
            >
              {isLast ? 'Завершить' : 'Далее'}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* ── Desktop: positioned tooltip ───────────────────────────────── */}
      {!isMobile && (
        <div
          style={getDesktopStyle()}
          className="bg-white rounded-xl shadow-2xl border border-zinc-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between px-4 pt-4 pb-2">
            <h3 className="text-sm font-semibold text-zinc-900 leading-snug pr-2">{step.title}</h3>
            <button
              onClick={endTour}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="px-4 pb-3 text-sm text-zinc-500 leading-relaxed">{step.body}</p>

          <div className="flex items-center justify-center gap-1.5 pb-3">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full transition-all duration-200',
                  i === currentStep ? 'w-4 h-1.5 bg-lime-600' : 'w-1.5 h-1.5 bg-zinc-200'
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-between px-4 pb-4 pt-1 border-t border-zinc-50">
            <button
              onClick={prevStep}
              disabled={isFirst}
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors',
                isFirst ? 'text-zinc-300 cursor-default' : 'text-zinc-600 hover:bg-zinc-100'
              )}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Назад
            </button>
            <span className="text-xs text-zinc-400 tabular-nums">
              {currentStep + 1} / {TOUR_STEPS.length}
            </span>
            <button
              onClick={nextStep}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-lime-600 text-white hover:bg-lime-700 transition-colors"
            >
              {isLast ? 'Готово' : 'Далее'}
              {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Navigation loading indicator */}
      {navigating && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[120] bg-white rounded-xl shadow-xl px-6 py-4 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-lime-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-zinc-700">Загрузка...</span>
        </div>
      )}
    </>
  )
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

/** Walk up DOM to find the nearest scrollable ancestor */
function getScrollParent(el: Element): Element {
  let node = el.parentElement
  while (node) {
    const { overflow, overflowY } = window.getComputedStyle(node)
    if (/auto|scroll/.test(overflow + overflowY)) return node
    node = node.parentElement
  }
  return document.documentElement
}
