import { cn } from '@/lib/utils'

interface BrandMarkProps {
  size?: number
  className?: string
}

export function BrandMark({ size = 30, className }: BrandMarkProps) {
  return (
    <span
      className={cn('inline-grid shrink-0 place-items-center rounded-[9px] bg-primary', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 32 32" fill="none" style={{ width: size * 0.5, height: size * 0.5 }}>
        <rect width="32" height="32" rx="9" fill="#2a58f0" />
        <path d="M11 9.5v13" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M11.6 15.9 20 9.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M11.6 15.9 20 22.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    </span>
  )
}
