import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  /** Ratio from 0 to 1; values outside the range are clamped. */
  value: number
  size?: 'sm' | 'md'
  /** Success state, e.g. an order that is fully funded. */
  complete?: boolean
  className?: string
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export function ProgressBar({ value, size = 'md', complete = false, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value))
  const reduceMotion = prefersReducedMotion()
  const [fill, setFill] = useState(reduceMotion ? clamped : 0)

  useEffect(() => {
    if (reduceMotion) {
      setFill(clamped)
      return
    }
    let frame2: number | undefined
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => setFill(clamped))
    })
    return () => {
      cancelAnimationFrame(frame1)
      if (frame2 !== undefined) cancelAnimationFrame(frame2)
    }
  }, [clamped, reduceMotion])

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      className={cn(
        'relative w-full overflow-hidden rounded-full bg-secondary',
        size === 'md' ? 'h-1.5' : 'h-1',
        className,
      )}
    >
      <span
        className={cn(
          'block h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none',
          complete
            ? 'bg-gradient-to-r from-positive to-positive/60'
            : 'bg-gradient-to-r from-primary to-primary/60',
        )}
        style={{ width: `${fill * 100}%` }}
      >
        {fill > 0 && !complete && (
          <span
            aria-hidden
            className={cn(
              'absolute top-1/2 -translate-y-1/2 right-0 rounded-full bg-white shadow-[0_0_6px] shadow-primary/70',
              size === 'md' ? 'size-[7px]' : 'size-[5px]',
            )}
          />
        )}
      </span>
    </div>
  )
}
