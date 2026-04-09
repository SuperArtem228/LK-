import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface Props {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-zinc-400" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-zinc-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-500 max-w-xs mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
