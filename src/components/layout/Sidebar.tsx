'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User2,
  Briefcase,
  Send,
  MessageSquare,
  Calendar,
  Bell,
  CreditCard,
  Zap,
  Settings,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ROUTES } from '@/lib/constants'
import { useNotificationsStore } from '@/store/notifications.store'

const navItems = [
  { href: ROUTES.DASHBOARD, label: 'Дашборд', icon: LayoutDashboard },
  { href: ROUTES.PROFILE, label: 'Профиль и резюме', icon: User2 },
  { href: ROUTES.JOBS, label: 'Вакансии', icon: Briefcase },
  { href: ROUTES.APPLICATIONS_QUEUE, label: 'Автоотклики', icon: Send },
  { href: ROUTES.APPLICATIONS_HISTORY, label: 'История откликов', icon: Briefcase, secondary: true },
  { href: ROUTES.MESSAGES, label: 'Сообщения', icon: MessageSquare },
  { href: ROUTES.INTERVIEWS, label: 'Интервью', icon: Calendar },
  { href: ROUTES.NOTIFICATIONS, label: 'Уведомления', icon: Bell, badge: true },
  { href: ROUTES.SUBSCRIPTION, label: 'Тариф', icon: CreditCard },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const unreadCount = useNotificationsStore((s) => s.unreadCount)

  return (
    <aside className="flex flex-col h-full w-[var(--sidebar-width,240px)] border-r border-zinc-100 bg-white px-3 py-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-6">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-zinc-900 text-base tracking-tight flex-1">Sofi</span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors md:hidden"
            aria-label="Закрыть меню"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                item.secondary ? 'ml-2' : '',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-indigo-600' : 'text-zinc-400')} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && unreadCount > 0 && (
                <span className="ml-auto bg-indigo-600 text-white text-xs font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="pt-3 border-t border-zinc-100">
        <Link
          href={ROUTES.SUBSCRIPTION}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all"
        >
          <Settings className="w-4 h-4 text-zinc-400" />
          <span>Настройки</span>
        </Link>
      </div>
    </aside>
  )
}
