'use client'

import { useState } from 'react'
import { Send, Clock, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { useDemoStore } from '@/store/demo.store'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils/cn'
import { formatSalary } from '@/lib/utils/format'
import { DAILY_APPLY_LIMIT } from '@/lib/constants'
import { toast } from 'sonner'
import type { Application } from '@/lib/types'

export function ApplicationsQueuePage() {
  const applications = useDemoStore((s) => s.applications)
  const updateApplicationStatus = useDemoStore((s) => s.updateApplicationStatus)
  const addNotification = useDemoStore((s) => s.addNotification)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dailyLimit, setDailyLimit] = useState(DAILY_APPLY_LIMIT)
  const [sending, setSending] = useState<string | null>(null)

  const queued = applications.filter((a) => ['planned', 'generating'].includes(a.status))
  const sentToday = applications.filter((a) => {
    if (!['sent', 'viewed', 'replied', 'interview', 'offer', 'rejected'].includes(a.status)) return false
    if (!a.sentAt) return false
    return Date.now() - new Date(a.sentAt).getTime() < 86400000
  }).length

  const scenario = useDemoStore((s) => s.scenario)

  async function handleSend(app: Application) {
    setSending(app.id)
    updateApplicationStatus(app.id, 'generating')
    await new Promise((r) => setTimeout(r, 1200))
    updateApplicationStatus(app.id, 'sent')
    addNotification({
      id: `notif-sent-${Date.now()}`,
      type: 'apply_sent',
      title: 'Отклик отправлен',
      body: `AI отправил отклик в ${app.company} на «${app.vacancyTitle}»`,
      relatedEntityId: app.id,
      relatedEntityType: 'application',
      createdAt: new Date().toISOString(),
      read: false,
    })
    toast.success(`Отклик отправлен в ${app.company}`)
    setSending(null)
  }

  return (
    <div>
      <PageHeader
        title="Очередь откликов"
        description="AI автоматически отправляет персонализированные отклики"
      />

      {/* Daily limit progress */}
      <div className="bg-white rounded-xl border border-zinc-100 p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold text-zinc-900">Дневной лимит</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-900 tabular-nums">{sentToday} / {dailyLimit}</span>
            <button
              onClick={() => setDailyLimit((p) => Math.min(DAILY_APPLY_LIMIT, p + 5))}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Изменить
            </button>
          </div>
        </div>
        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${Math.min(100, (sentToday / dailyLimit) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-zinc-500 mt-1.5">
          {dailyLimit - sentToday > 0
            ? `Осталось ${dailyLimit - sentToday} откликов на сегодня`
            : 'Дневной лимит достигнут'}
        </p>
      </div>

      {queued.length === 0 ? (
        <EmptyState
          icon={Send}
          title="Очередь пуста"
          description="Добавьте вакансии в очередь из раздела «Вакансии»"
        />
      ) : (
        <div className="space-y-3" data-tour-id="queued-list">
          {queued.map((app) => (
            <QueueRow
              key={app.id}
              app={app}
              expanded={expandedId === app.id}
              sending={sending === app.id}
              onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
              onSend={() => handleSend(app)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function QueueRow({
  app, expanded, sending, onToggle, onSend
}: {
  app: Application
  expanded: boolean
  sending: boolean
  onToggle: () => void
  onSend: () => void
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-zinc-500">{app.company.slice(0, 2).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate">{app.vacancyTitle}</p>
          <p className="text-xs text-zinc-500">{app.company}</p>
        </div>
        <StatusBadge status={app.status} size="sm" />
        <div className="flex items-center gap-2">
          <button
            onClick={onSend}
            disabled={sending || app.status === 'generating'}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              app.status === 'generating' || sending
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            )}
          >
            {sending ? (
              <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Отправка...</>
            ) : (
              <><Send className="w-3 h-3" /> Отправить</>
            )}
          </button>
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-zinc-50 transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-zinc-50 px-5 py-4 animate-fade-in" data-tour-id="cover-letter-preview">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Сопроводительное письмо</h4>
          <p className="text-sm text-zinc-700 leading-relaxed">{app.coverLetter}</p>
          <p className="text-xs text-zinc-400 mt-3 flex items-center gap-1">
            <Zap className="w-3 h-3 text-indigo-400" />
            Сгенерировано AI на основе вашего профиля
          </p>
        </div>
      )}
    </div>
  )
}
