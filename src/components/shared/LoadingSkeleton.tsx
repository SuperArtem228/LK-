import { cn } from '@/lib/utils/cn'

interface Props {
  className?: string
  rows?: number
  rowHeight?: string
}

export function LoadingSkeleton({ className, rows = 3, rowHeight = 'h-14' }: Props) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={cn('skeleton w-full', rowHeight)} />
      ))}
    </div>
  )
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-zinc-100 p-5 space-y-3', className)}>
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton h-8 w-1/2" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  )
}
