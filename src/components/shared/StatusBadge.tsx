import { ORDER_STATUS_LABELS } from '@/features/orders/components/status'
import type { OrderStatus } from '@/features/orders/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

const CLASSES: Record<OrderStatus, string> = {
  open: 'bg-secondary text-muted-foreground border border-border',
  allocated: 'bg-warning-soft text-warning',
  paid: 'bg-brand-soft text-accent-foreground',
  completed: 'bg-positive-soft text-positive',
}

const DOTS: Record<OrderStatus, string> = {
  open: 'bg-muted-foreground/60',
  allocated: 'bg-warning-dot',
  paid: 'bg-primary',
  completed: 'bg-positive-dot',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-medium whitespace-nowrap',
        CLASSES[status],
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', DOTS[status])} />
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}
