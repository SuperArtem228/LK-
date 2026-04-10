import { cn } from '@/lib/utils/cn'

/** Three diagonal stripes — the HHLab brand mark */
function HHLabMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left stripe — tall */}
      <rect
        x="2.5"
        y="5"
        width="5.5"
        height="18"
        rx="1.5"
        fill="currentColor"
        transform="rotate(12 5.75 14)"
      />
      {/* Middle stripe — shorter */}
      <rect
        x="11"
        y="8"
        width="5.5"
        height="12"
        rx="1.5"
        fill="currentColor"
        transform="rotate(12 13.75 14)"
      />
      {/* Right stripe — tall */}
      <rect
        x="19.5"
        y="5"
        width="5.5"
        height="18"
        rx="1.5"
        fill="currentColor"
        transform="rotate(12 22.25 14)"
      />
    </svg>
  )
}

interface HHLabLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

/** Rounded square logo container with HHLab mark — use in sidebar / auth screens */
export function HHLabLogo({ size = 'sm', className }: HHLabLogoProps) {
  const containerCls = {
    xs: 'w-6 h-6 rounded-md',
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
  }[size]

  const iconCls = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size]

  return (
    <div className={cn('bg-lime-500 flex items-center justify-center flex-shrink-0', containerCls, className)}>
      <HHLabMark className={cn('text-zinc-950', iconCls)} />
    </div>
  )
}
