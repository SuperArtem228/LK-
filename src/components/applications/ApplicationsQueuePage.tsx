'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, ChevronDown, ChevronUp, Zap, Play, Pause, CheckCircle2, Clock, Sparkles, FileText } from 'lucide-react'
import { useDemoStore } from '@/store/demo.store'
import { useNotificationsStore } from '@/store/notifications.store'
import { useTourStore } from '@/store/tour.store'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils/cn'
import { DAILY_APPLY_LIMIT } from '@/lib/constants'
import { toast } from 'sonner'
import type { Application } from '@/lib/types'

const COVER_LETTER_TOUR_STEP = 7

// Auto-apply step labels shown in the row during animation
const APPLY_STEPS = [
  { label: 'Анализ соответствия...', duration: 900 },
  { label: 'Генерация письма...', duration: 1100 },
  { label: 'Отправка отклика...', duration: 700 },
]

type ActivityEntry = { id: string; company: string; title: string; at: string }

export function ApplicationsQueuePage() {
  const applications = useDemoStore((s) => s.applications)
  const updateApplicationStatus = useDemoStore((s) => s.updateApplicationStatus)
  const addNotification = useDemoStore((s) => s.addNotification)
  const addNotifStore = useNotificationsStore((s) => s.addNotification)
  const tourActive = useTourStore((s) => s.active)
  const tourStep = useTourStore((s) => s.currentStep)

  const queued = applications.filter((a) => ['planned', 'generating'].includes(a.status))
  const sentToday = applications.filter((a) =>
    ['sent', 'viewed', 'replied', 'interview', 'offer', 'rejected'].includes(a.status) &&
    a.sentAt && Date.now() - new Date(a.sentAt).getTime() < 86400000
  ).length

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [processStep, setProcessStep] = useState(0) // 0-2 for 3 sub-steps
  const [autoRunning, setAutoRunning] = useState(false)
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const abortRef = useRef(false)

  // Auto-expand first item for tour step
  useEffect(() => {
    if (tourActive && tourStep === COVER_LETTER_TOUR_STEP && queued.length > 0) {
      setExpandedId(queued[0].id)
    }
  }, [tourActive, tourStep]) // eslint-disable-line react-hooks/exhaustive-deps

  const dailyRemaining = DAILY_APPLY_LIMIT - sentToday

  async function sendOne(app: Application): Promise<void> {
    setProcessingId(app.id)
    setExpandedId(null)

    for (let i = 0; i < APPLY_STEPS.length; i++) {
      if (abortRef.current) break
      setProcessStep(i)
      await new Promise((r) => setTimeout(r, APPLY_STEPS[i].duration))
    }

    if (!abortRef.current) {
      updateApplicationStatus(app.id, 'sent')
      const notif = {
        id: `notif-sent-${Date.now()}`,
        type: 'apply_sent' as const,
        title: 'Отклик отправлен',
        body: `AI отправил отклик в ${app.company} на «${app.vacancyTitle}»`,
        relatedEntityId: app.id,
        relatedEntityType: 'application' as const,
        createdAt: new Date().toISOString(),
        read: false,
      }
      addNotification(notif)
      addNotifStore(notif)
      setActivity((prev) => [
        { id: app.id, company: app.company, title: app.vacancyTitle, at: new Date().toISOString() },
        ...prev.slice(0, 9),
      ])
    }

    setProcessingId(null)
    setProcessStep(0)
  }

  async function handleRunAll() {
    abortRef.current = false
    setAutoRunning(true)
    const toSend = applications
      .filter((a) => a.status === 'planned')
      .slice(0, dailyRemaining)

    for (const app of toSend) {
      if (abortRef.current) break
      await sendOne(app)
      await new Promise((r) => setTimeout(r, 400))
    }

    setAutoRunning(false)
    if (!abortRef.current) {
      toast.success(`Автоотклик завершён — отправлено ${toSend.length} заявок`)
    }
  }

  function handleStop() {
    abortRef.current = true
    setAutoRunning(false)
    setProcessingId(null)
    toast('Автоотклик остановлен')
  }

  async function handleSendOne(app: Application) {
    abortRef.current = false
    await sendOne(app)
    toast.success(`Отклик отправлен в ${app.company}`)
  }

  const sentCount = applications.filter((a) => !['planned', 'generating'].includes(a.status)).length
  const totalApps = applications.filter((a) => a.source === 'auto').length

  return (
    <div>
      <PageHeader
        title="Автоотклики"
        description={`${queued.length} в очереди · ${sentToday} отправлено сегодня`}
      />

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-zinc-100 p-4 text-center">
          <p className="text-2xl font-bold text-zinc-900 tabular-nums">{queued.length}</p>
          <p className="text-xs text-zinc-500 mt-0.5">В очереди</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-100 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600 tabular-nums">{sentCount}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Отправлено всего</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600 tabular-nums">{dailyRemaining}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Осталось сегодня</p>
        </div>
      </div>

      {/* Daily limit bar + run button */}
      <div className="bg-white rounded-xl border border-zinc-100 p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            <div>
              <span className="text-sm font-semibold text-zinc-900">Дневной лимит</span>
              <span className="text-xs text-zinc-400 ml-2">{sentToday} / {DAILY_APPLY_LIMIT}</span>
            </div>
          </div>

          {queued.length > 0 && (
            <button
              onClick={autoRunning ? handleStop : handleRunAll}
              disabled={dailyRemaining === 0}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                autoRunning
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  : dailyRemaining === 0
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20'
              )}
            >
              {autoRunning ? (
                <><Pause className="w-4 h-4" /> Остановить</>
              ) : (
                <><Play className="w-4 h-4" /> Запустить все</>
              )}
            </button>
          )}
        </div>

        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              autoRunning ? 'bg-indigo-500 animate-pulse' : 'bg-indigo-500'
            )}
            style={{ width: `${Math.min(100, (sentToday / DAILY_APPLY_LIMIT) * 100)}%` }}
          />
        </div>

        {autoRunning && processingId && (
          <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1.5 animate-fade-in">
            <span className="w-2.5 h-2.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin inline-block" />
            {APPLY_STEPS[processStep]?.label}
          </p>
        )}
        {!autoRunning && (
          <p className="text-xs text-zinc-400 mt-1.5">
            {dailyRemaining > 0
              ? `Осталось ${dailyRemaining} откликов на сегодня`
              : 'Дневной лимит достигнут — продолжим завтра'}
          </p>
        )}
      </div>

      {/* Activity log */}
      {activity.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden mb-5 animate-fade-in">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-50">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-zinc-900">Только что отправлено</span>
          </div>
          <div className="divide-y divide-zinc-50">
            {activity.map((a) => (
              <div key={a.id + a.at} className="flex items-center gap-3 px-5 py-3 animate-fade-in">
                <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{a.title}</p>
                  <p className="text-xs text-zinc-500">{a.company}</p>
                </div>
                <span className="text-xs text-green-600 font-medium flex-shrink-0">Отправлено</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {queued.length === 0 ? (
        <EmptyState
          icon={Send}
          title="Очередь пуста"
          description="Все отклики из очереди отправлены. Добавьте новые вакансии в разделе «Вакансии»"
        />
      ) : (
        <div className="space-y-3" data-tour-id="queued-list">
          {queued.map((app) => (
            <QueueRow
              key={app.id}
              app={app}
              expanded={expandedId === app.id}
              isProcessing={processingId === app.id}
              processStep={processingId === app.id ? processStep : -1}
              onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
              onSend={() => handleSendOne(app)}
              disabled={autoRunning}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function QueueRow({
  app, expanded, isProcessing, processStep, onToggle, onSend, disabled,
}: {
  app: Application
  expanded: boolean
  isProcessing: boolean
  processStep: number
  onToggle: () => void
  onSend: () => void
  disabled: boolean
}) {
  const stepLabel = isProcessing && processStep >= 0 ? APPLY_STEPS[processStep]?.label : null

  return (
    <div className={cn(
      'bg-white rounded-xl border overflow-hidden transition-all',
      isProcessing ? 'border-indigo-200 shadow-sm shadow-indigo-100' : 'border-zinc-100'
    )}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Company logo */}
        <div className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors',
          isProcessing ? 'bg-indigo-50 text-indigo-600' : 'bg-zinc-100 text-zinc-500'
        )}>
          {isProcessing
            ? <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            : app.company.slice(0, 2).toUpperCase()
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate">{app.vacancyTitle}</p>
          <p className={cn('text-xs truncate transition-colors', isProcessing ? 'text-indigo-500' : 'text-zinc-400')}>
            {isProcessing && stepLabel ? stepLabel : app.company}
          </p>
        </div>

        {/* Status */}
        {isProcessing ? (
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI работает
          </span>
        ) : (
          <span className="text-xs font-medium text-zinc-400 bg-zinc-50 px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            В очереди
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isProcessing && (
            <button
              onClick={onSend}
              disabled={disabled}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                disabled ? 'text-zinc-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'
              )}
            >
              <Send className="w-3 h-3" />
              <span className="hidden sm:inline">Отправить</span>
            </button>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            {expanded
              ? <ChevronUp className="w-4 h-4 text-zinc-400" />
              : <ChevronDown className="w-4 h-4 text-zinc-400" />
            }
          </button>
        </div>
      </div>

      {/* Processing progress bar */}
      {isProcessing && (
        <div className="px-4 pb-3">
          <div className="flex gap-1">
            {APPLY_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-all duration-500',
                  i < processStep ? 'bg-indigo-500' : i === processStep ? 'bg-indigo-300 animate-pulse' : 'bg-zinc-100'
                )}
              />
            ))}
          </div>
        </div>
      )}

      {expanded && !isProcessing && (
        <div className="border-t border-zinc-50 px-4 py-4 animate-fade-in" data-tour-id="cover-letter-preview">
          <div className="flex items-center gap-1.5 mb-2.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Сопроводительное письмо</h4>
          </div>
          <p className="text-sm text-zinc-700 leading-relaxed">{app.coverLetter}</p>
          <p className="text-xs text-zinc-400 mt-3 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Персонализировано AI под эту вакансию
          </p>
        </div>
      )}
    </div>
  )
}
