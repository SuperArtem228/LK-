'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, RefreshCw, Menu } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ROUTES } from '@/lib/constants'
import { useNotificationsStore } from '@/store/notifications.store'
import { useDemoStore } from '@/store/demo.store'
import { useUIStore } from '@/store/ui.store'
import { formatDate } from '@/lib/utils/dates'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Дашборд',
  '/profile': 'Профиль',
  '/jobs': 'Вакансии',
  '/applications/queue': 'Автоотклики',
  '/applications/history': 'История',
  '/messages': 'Сообщения',
  '/interviews': 'Интервью',
  '/notifications': 'Уведомления',
  '/subscription': 'Тариф',
}

interface Props {
  title?: string
}

export function Header({ title }: Props) {
  const unreadCount = useNotificationsStore((s) => s.unreadCount)
  const scenario = useDemoStore((s) => s.scenario)
  const openDrawer = useUIStore((s) => s.openDrawer)
  const pathname = usePathname()
  const pageTitle = title ?? PAGE_TITLES[pathname] ?? 'Sofi'

  return (
    <header className="h-14 border-b border-zinc-100 bg-white flex items-center px-4 md:px-6 gap-3">
      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 -ml-1 rounded-lg hover:bg-zinc-50 transition-colors flex-shrink-0"
        onClick={openDrawer}
        aria-label="Открыть меню"
      >
        <Menu className="w-5 h-5 text-zinc-600" />
      </button>

      {/* Mobile page title */}
      <span className="md:hidden text-sm font-semibold text-zinc-900 flex-shrink-0">{pageTitle}</span>

      {/* HH status — hidden on mobile */}
      <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
        <span>HeadHunter синхронизирован</span>
        <span className="text-zinc-300">·</span>
        <span>
          {scenario.hhConnection.lastSyncAt
            ? formatDate(scenario.hhConnection.lastSyncAt, 'd MMM, HH:mm')
            : '—'}
        </span>
        <button className="ml-1 hover:text-zinc-700 transition-colors">
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1" />

      {/* Notifications bell */}
      <Link href={ROUTES.NOTIFICATIONS} className="relative p-2 rounded-lg hover:bg-zinc-50 transition-colors">
        <Bell className="w-5 h-5 text-zinc-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>

      {/* Avatar */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
          {scenario.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-zinc-900 leading-tight">{scenario.user.name}</p>
          <p className="text-xs text-zinc-500 leading-tight">Пробный период</p>
        </div>
      </div>
    </header>
  )
}
