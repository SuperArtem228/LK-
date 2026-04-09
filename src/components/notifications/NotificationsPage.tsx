'use client'

import { useRouter } from 'next/navigation'
import { Bell, BellOff, Briefcase, Calendar, CheckCheck, MessageSquare, Sparkles, Star, Zap } from 'lucide-react'
import { useNotificationsStore } from '@/store/notifications.store'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils/cn'
import { fromNow } from '@/lib/utils/dates'
import { NOTIFICATION_TYPE_LABELS, ROUTES } from '@/lib/constants'
import type { Notification, NotificationType } from '@/lib/types'

const TYPE_ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  vacancy_found: Sparkles,
  apply_sent: Zap,
  recruiter_reply: MessageSquare,
  interview_scheduled: Calendar,
  resume_updated: Star,
  trial_expiring: Bell,
  hh_connected: Briefcase,
  application_viewed: Briefcase,
}

const TYPE_COLORS: Record<NotificationType, string> = {
  vacancy_found: 'bg-indigo-50 text-indigo-600',
  apply_sent: 'bg-blue-50 text-blue-600',
  recruiter_reply: 'bg-green-50 text-green-600',
  interview_scheduled: 'bg-purple-50 text-purple-600',
  resume_updated: 'bg-amber-50 text-amber-600',
  trial_expiring: 'bg-red-50 text-red-500',
  hh_connected: 'bg-zinc-100 text-zinc-600',
  application_viewed: 'bg-zinc-100 text-zinc-600',
}

const RELATED_ROUTES: Record<string, string> = {
  vacancy: ROUTES.JOBS,
  application: ROUTES.APPLICATIONS_HISTORY,
  thread: ROUTES.MESSAGES,
  interview: ROUTES.INTERVIEWS,
}

export function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationsStore()
  const router = useRouter()

  function handleClick(n: Notification) {
    if (!n.read) markRead(n.id)
    if (n.relatedEntityType) {
      router.push(RELATED_ROUTES[n.relatedEntityType] ?? ROUTES.DASHBOARD)
    }
  }

  const groups = groupByDate(notifications)

  return (
    <div>
      <PageHeader
        title="Уведомления"
        description={unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Все прочитаны'}
        action={
          unreadCount > 0 ? (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              Прочитать все
            </button>
          ) : null
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Уведомлений нет"
          description="Здесь появятся обновления по вашим откликам, интервью и новым вакансиям"
        />
      ) : (
        <div className="space-y-6" data-tour-id="notification-list">
          {groups.map(({ label, items }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">{label}</p>
              <div className="bg-white rounded-xl border border-zinc-100 divide-y divide-zinc-50 overflow-hidden">
                {items.map((n) => (
                  <NotificationRow key={n.id} notification={n} onClick={() => handleClick(n)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationRow({ notification: n, onClick }: { notification: Notification; onClick: () => void }) {
  const Icon = TYPE_ICONS[n.type] ?? Bell
  const colorClass = TYPE_COLORS[n.type] ?? 'bg-zinc-100 text-zinc-500'

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-zinc-50/60',
        !n.read && 'bg-indigo-50/30'
      )}
    >
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={cn('text-sm font-medium text-zinc-900', !n.read && 'font-semibold')}>
              {n.title}
            </p>
            <p className="text-sm text-zinc-500 mt-0.5 leading-relaxed">{n.body}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-zinc-400">{fromNow(n.createdAt)}</span>
            {!n.read && (
              <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
            )}
          </div>
        </div>
        <span className="inline-block mt-1.5 text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
          {NOTIFICATION_TYPE_LABELS[n.type]}
        </span>
      </div>
    </div>
  )
}

function groupByDate(notifications: Notification[]): { label: string; items: Notification[] }[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)

  const groups: { label: string; items: Notification[] }[] = [
    { label: 'Сегодня', items: [] },
    { label: 'Вчера', items: [] },
    { label: 'На этой неделе', items: [] },
    { label: 'Ранее', items: [] },
  ]

  for (const n of notifications) {
    const d = new Date(n.createdAt)
    if (d >= today) groups[0].items.push(n)
    else if (d >= yesterday) groups[1].items.push(n)
    else if (d >= weekAgo) groups[2].items.push(n)
    else groups[3].items.push(n)
  }

  return groups.filter((g) => g.items.length > 0)
}
