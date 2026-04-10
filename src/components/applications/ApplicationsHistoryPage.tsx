'use client'

import { useState, useMemo } from 'react'
import { Filter, Briefcase, ChevronDown, ChevronUp, MessageSquare, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useDemoStore } from '@/store/demo.store'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils/cn'
import { fromNow } from '@/lib/utils/dates'
import { ROUTES, STATUS_LABELS } from '@/lib/constants'
import type { Application, ApplicationStatus } from '@/lib/types'

const STATUSES: (ApplicationStatus | 'all')[] = ['all', 'sent', 'viewed', 'replied', 'interview', 'test_task', 'offer', 'rejected']

export function ApplicationsHistoryPage() {
  const applications = useDemoStore((s) => s.applications)
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')

  const filtered = useMemo(() => {
    const active = applications.filter((a) => !['planned', 'generating'].includes(a.status))
    if (statusFilter === 'all') return active
    return active.filter((a) => a.status === statusFilter)
  }, [applications, statusFilter])

  if (viewMode === 'kanban') {
    return <KanbanView applications={applications} onSwitchToTable={() => setViewMode('table')} />
  }

  return (
    <div>
      <PageHeader
        title="История откликов"
        description={`${filtered.length} откликов`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'kanban' : 'table')}
              className="px-3 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-all"
            >
              {viewMode === 'table' ? 'Канбан' : 'Таблица'}
            </button>
          </div>
        }
      />

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
              statusFilter === s
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
            )}
          >
            {s === 'all' ? 'Все' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="Откликов нет" description="Отклики появятся после первой отправки" />
      ) : (
        <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
          <div className="divide-y divide-zinc-50">
            {filtered.map((app) => (
              <div key={app.id} className="overflow-hidden">
                <div
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50/50 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-zinc-500">{app.company.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{app.vacancyTitle}</p>
                    <p className="text-xs text-zinc-500">{app.company}</p>
                  </div>
                  <StatusBadge status={app.status} size="sm" />
                  <span className="text-xs text-zinc-400 hidden sm:block">
                    {app.sentAt ? fromNow(app.sentAt) : '—'}
                  </span>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-500 flex-shrink-0',
                    app.source === 'auto' ? 'bg-lime-50 text-lime-600' : ''
                  )}>
                    {app.source === 'auto' ? 'AI' : 'Вручную'}
                  </span>
                  {expandedId === app.id
                    ? <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  }
                </div>

                {expandedId === app.id && (
                  <div className="px-5 pb-4 pt-1 border-t border-zinc-50 animate-fade-in">
                    {/* Status history */}
                    {app.statusHistory.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-zinc-500 mb-2">История статусов</p>
                        <div className="flex flex-wrap gap-2">
                          {app.statusHistory.map((h, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <StatusBadge status={h.status} size="sm" />
                              <span className="text-xs text-zinc-400">{fromNow(h.at)}</span>
                              {i < app.statusHistory.length - 1 && <span className="text-zinc-200">→</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cover letter preview */}
                    {app.coverLetter && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-zinc-500 mb-1.5">Сопроводительное письмо</p>
                        <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">{app.coverLetter}</p>
                      </div>
                    )}

                    {/* Quick actions */}
                    <div className="flex gap-3 mt-2">
                      <Link href={ROUTES.MESSAGES} className="flex items-center gap-1.5 text-xs text-lime-600 font-medium hover:text-lime-800">
                        <MessageSquare className="w-3.5 h-3.5" /> Переписка
                      </Link>
                      <Link href={ROUTES.INTERVIEWS} className="flex items-center gap-1.5 text-xs text-lime-600 font-medium hover:text-lime-800">
                        <Calendar className="w-3.5 h-3.5" /> Интервью
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KanbanView({ applications, onSwitchToTable }: { applications: Application[]; onSwitchToTable: () => void }) {
  type ApplicationStatus = 'planned' | 'generating' | 'sent' | 'viewed' | 'replied' | 'interview' | 'test_task' | 'offer' | 'rejected'
  const columns: ApplicationStatus[] = ['sent', 'viewed', 'replied', 'interview', 'offer', 'rejected']

  return (
    <div>
      <PageHeader
        title="История откликов"
        action={
          <button
            onClick={onSwitchToTable}
            className="px-3 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50"
          >
            Таблица
          </button>
        }
      />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colApps = applications.filter((a) => a.status === col)
          return (
            <div key={col} className="flex-shrink-0 w-60">
              <div className="flex items-center gap-2 mb-3">
                <StatusBadge status={col} />
                <span className="text-xs text-zinc-400">{colApps.length}</span>
              </div>
              <div className="space-y-2">
                {colApps.map((app) => (
                  <div key={app.id} className="bg-white rounded-lg border border-zinc-100 p-3">
                    <p className="text-sm font-medium text-zinc-900 truncate">{app.vacancyTitle}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{app.company}</p>
                    {app.sentAt && <p className="text-xs text-zinc-400 mt-1">{fromNow(app.sentAt)}</p>}
                  </div>
                ))}
                {colApps.length === 0 && (
                  <div className="h-16 rounded-lg border border-dashed border-zinc-200 flex items-center justify-center">
                    <span className="text-xs text-zinc-300">Нет откликов</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
