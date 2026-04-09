import { cn } from '@/lib/utils/cn'

interface Props {
  percent: number
  className?: string
  size?: 'sm' | 'md'
}

function getMatchColor(pct: number) {
  if (pct >= 85) return 'bg-green-50 text-green-700 border-green-200'
  if (pct >= 70) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-zinc-100 text-zinc-600 border-zinc-200'
}

export function MatchBadge({ percent, className, size = 'md' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        getMatchColor(percent),
        className
      )}
    >
      {percent}% совпадение
    </span>
  )
}
