'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Send, MessageSquare, Calendar, TrendingUp, Zap, Search, Clock, Bell, ArrowRight, ChevronRight } from 'lucide-react'
import { useDemoStore } from '@/store/demo.store'
import { useDashboardStore } from '@/store/dashboard.store'
import { useNotificationsStore } from '@/store/notifications.store'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils/cn'
import { fromNow, formatDateTime, daysUntil } from '@/lib/utils/dates'
import { formatPercent, formatCount, formatDaysLeft } from '@/lib/utils/format'
import { ROUTES, NOTIFICATION_TYPE_LABELS } from '@/lib/constants'
import type { DashboardPeriod, Notification } from '@/lib/types'

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: 'Сегодня',
  '7d': '7 дней',
  '30d': '30 дней',
  all: 'Всё время',
}

function filterByPeriod<T extends { sentAt?: string; createdAt?: string }>(
  items: T[],
  period: DashboardPeriod
): T[] {
  if (period === 'all') return items
  const now = Date.now()
  const ms = period === 'today' ? 86400000 : period === '7d' ? 604800000 : 2592000000
  return items.filter((item) => {
    const date = item.sentAt ?? item.createdAt
    if (!date) return false
    return now - new Date(date).getTime() < ms
  })
}

export function DashboardPage() {
  const scenario = useDemoStore((s) => s.scenario)
  const applications = useDemoStore((s) => s.applications)
  const interviews = useDemoStore((s) => s.interviews)
  const notifications = useNotificationsStore((s) => s.notifications)
  const period = useDashboardStore((s) => s.period)
  const setPeriod = useDashboardStore((s) => s.setPeriod)

  const stats = useMemo(() => {
    const filtered = filterByPeriod(applications, period)
    const sent = filtered.filter((a) => !['planned', 'generating'].includes(a.status)).length
    const replied = filtered.filter((a) => ['replied', 'interview', 'test_task', 'offer'].includes(a.status)).length
    const interviewCount = interviews.filter((i) => i.status === 'upcoming').length
    const conversion = sent > 0 ? Math.round((replied / sent) * 100) : 0
    const queued = applications.filter((a) => ['planned', 'generating'].includes(a.status)).length
    return { sent, replied, interviewCount, conversion, queued }
  }, [applications, interviews, period])

  const recentNotifications = notifications.slice(0, 5)
  const upcomingInterview = interviews.find((i) => i.status === 'upcoming')
  const trialDaysLeft = scenario.user.trialDaysLeft

  const actionItems = [
    scenario.resumes.find((r) => r.version === 'original') && {
      label: 'Улучшить резюме с AI',
      href: ROUTES.PROFILE,
      urgent: false,
    },
    notifications.some((n) => !n.read && n.type === 'recruiter_reply') && {
      label: 'Новое сообщение от рекрутера',
      href: ROUTES.MESSAGES,
      urgent: true,
    },
    upcomingInterview && {
      label: `Подготовиться к интервью — ${upcomingInterview.company}`,
      href: ROUTES.INTERVIEWS,
      urgent: daysUntil(upcomingInterview.scheduledAt) <= 1,
    },
  ].filter(Boolean) as Array<{ label: string; href: string; urgent: boolean }>

  return (
    <div>
      <PageHeader
        title="Дашборд"
        description={`${scenario.user.name} · ${scenario.user.city}`}
        action={
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1">
            {(Object.keys(PERIOD_LABELS) as DashboardPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  period === p ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'
                )}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        }
      />

      {/* Trial banner */}
      {trialDaysLeft <= 9 && (
        <div className="mb-5 flex items-center justify-between rounded-xl bg-indigo-50 border border-indigo-100 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="text-sm text-indigo-800 font-medium">
              Пробный период: осталось {formatDaysLeft(trialDaysLeft)}
            </span>
          </div>
          <Link href={ROUTES.SUBSCRIPTION} className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1">
            Продлить <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left col: stats + timeline */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-tour-id="stats-grid">
            <StatCard
              icon={Send}
              label="Откликов отправлено"
              value={stats.sent}
              color="blue"
            />
            <StatCard
              icon={MessageSquare}
              label="Ответов получено"
              value={stats.replied}
              color="amber"
            />
            <StatCard
              icon={Calendar}
              label="Интервью"
              value={stats.interviewCount}
              color="indigo"
            />
            <StatCard
              icon={TrendingUp}
              label="Конверсия"
              value={`${stats.conversion}%`}
              color="green"
            />
          </div>

          {/* Recent applications */}
          <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
              <h3 className="text-sm font-semibold text-zinc-900">Последние отклики</h3>
              <Link href={ROUTES.APPLICATIONS_HISTORY} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Все <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-zinc-50">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-zinc-500">{app.company.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{app.vacancyTitle}</p>
                    <p className="text-xs text-zinc-500 truncate">{app.company}</p>
                  </div>
                  <StatusBadge status={app.status} size="sm" />
                  {app.sentAt && (
                    <span className="text-xs text-zinc-400 flex-shrink-0 hidden sm:block">{fromNow(app.sentAt)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Event timeline */}
          <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden" data-tour-id="action-feed">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
              <h3 className="text-sm font-semibold text-zinc-900">Лента событий</h3>
              <Link href={ROUTES.NOTIFICATIONS} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Все <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-zinc-50">
              {recentNotifications.map((n) => (
                <NotifRow key={n.id} notification={n} />
              ))}
            </div>
          </div>
        </div>

        {/* Right col: AI progress + actions */}
        <div className="space-y-5">
          {/* AI Progress */}
          <div className="bg-white rounded-xl border border-zinc-100 p-5" data-tour-id="ai-progress">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Zap className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">AI-поиск</h3>
            </div>
            <div className="space-y-4">
              <AIProgressItem
                icon={Search}
                label="Вакансий найдено"
                value={scenario.hhConnection.importedVacancies}
                max={300}
                color="indigo"
              />
              <AIProgressItem
                icon={TrendingUp}
                label="Отобрано AI"
                value={scenario.vacancies.length}
                max={scenario.hhConnection.importedVacancies}
                color="violet"
              />
              <AIProgressItem
                icon={Send}
                label="В очереди откликов"
                value={stats.queued}
                max={20}
                color="blue"
              />
            </div>
          </div>

          {/* Action items */}
          {actionItems.length > 0 && (
            <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-50">
                <h3 className="text-sm font-semibold text-zinc-900">Требуют внимания</h3>
              </div>
              <div className="divide-y divide-zinc-50">
                {actionItems.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50 transition-colors"
                  >
                    {item.urgent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    )}
                    <span className="flex-1 text-sm text-zinc-700">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-300" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming interview */}
          {upcomingInterview && (
            <Link
              href={ROUTES.INTERVIEWS}
              className="block bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white hover:opacity-95 transition-opacity"
            >
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 opacity-80" />
                <span className="text-xs font-medium opacity-80">Ближайшее интервью</span>
              </div>
              <p className="font-semibold">{upcomingInterview.company}</p>
              <p className="text-sm opacity-80 mt-0.5">{upcomingInterview.vacancyTitle}</p>
              <p className="text-sm font-medium mt-3 opacity-90">{formatDateTime(upcomingInterview.scheduledAt)}</p>
              <p className="text-xs opacity-70 mt-1">
                {upcomingInterview.stage === 'hr' ? 'HR-интервью' : 'С нанимающим менеджером'} ·{' '}
                {upcomingInterview.format === 'video' ? 'Видео' : 'Телефон'}
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon, label, value, color
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  color: 'blue' | 'amber' | 'indigo' | 'green'
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
  }
  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-4">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', colorMap[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-zinc-900 tabular-nums">{value}</p>
      <p className="text-xs text-zinc-500 mt-1 leading-tight">{label}</p>
    </div>
  )
}

function AIProgressItem({
  icon: Icon, label, value, max, color
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  max: number
  color: string
}) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const colorBar = color === 'indigo' ? 'bg-indigo-500' : color === 'violet' ? 'bg-violet-500' : 'bg-blue-500'
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-zinc-600">{label}</span>
        <span className="text-xs font-semibold text-zinc-900 tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', colorBar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function NotifRow({ notification: n }: { notification: Notification }) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    vacancy_found: Search,
    apply_sent: Send,
    recruiter_reply: MessageSquare,
    interview_scheduled: Calendar,
    resume_updated: Zap,
    trial_expiring: Clock,
    hh_connected: Zap,
    application_viewed: Bell,
  }
  const Icon = icons[n.type] ?? Bell
  return (
    <div className="flex items-start gap-3 px-5 py-3.5">
      <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', n.read ? 'bg-zinc-100' : 'bg-indigo-50')}>
        <Icon className={cn('w-3.5 h-3.5', n.read ? 'text-zinc-400' : 'text-indigo-600')} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-tight', n.read ? 'text-zinc-600' : 'text-zinc-900 font-medium')}>{n.title}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{fromNow(n.createdAt)}</p>
      </div>
      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />}
    </div>
  )
}
