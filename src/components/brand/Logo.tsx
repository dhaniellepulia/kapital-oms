import { cn } from '@/lib/utils'
import { BrandMark } from './BrandMark'

interface LogoProps {
  tagline?: string
  className?: string
}

export function Logo({ tagline = 'Order Management', className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-[11px]', className)}>
      <BrandMark size={30} />
      <span className="leading-tight max-[900px]:hidden">
        <span className="block font-display text-[14.5px] font-semibold tracking-tight">Kapital</span>
        <span className="block text-[9.5px] font-medium uppercase tracking-[0.1em] text-dim">
          {tagline}
        </span>
      </span>
    </div>
  )
}
