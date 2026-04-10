import { cn } from '@/lib/utils/cn'
import { STATUS_LABELS } from '@/lib/constants'
import type { ApplicationStatus } from '@/lib/types'

const statusStyles: Record<ApplicationStatus, string> = {
  planned: 'bg-zinc-100 text-zinc-600',
  generating: 'bg-violet-100 text-violet-700 animate-pulse',
  sent: 'bg-blue-50 text-blue-600',
  viewed: 'bg-purple-50 text-purple-700',
  replied: 'bg-amber-50 text-amber-700',
  interview: 'bg-lime-50 text-lime-700',
  test_task: 'bg-orange-50 text-orange-700',
  offer: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-500',
}

interface Props {
  status: ApplicationStatus
  className?: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, className, size = 'md' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        statusStyles[status],
        className
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
