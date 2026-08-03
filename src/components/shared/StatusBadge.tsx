import { ORDER_STATUS_LABELS } from '@/features/orders/components/status'
import type { OrderStatus } from '@/features/orders/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

const CLASSES: Record<OrderStatus, string> = {
  open: 'bg-secondary text-[#52525c] border border-border',
  allocated: 'bg-warning-soft text-warning',
  paid: 'bg-brand-soft text-[#2446b5]',
  completed: 'bg-positive-soft text-positive',
}

const DOTS: Record<OrderStatus, string> = {
  open: 'bg-[#a2a2ad]',
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
