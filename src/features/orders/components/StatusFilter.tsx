import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ORDER_STATUS_LABELS } from './status'
import type { OrderStatus } from '../types'
import { cn } from '@/lib/utils'

interface StatusFilterProps {
  value: OrderStatus | 'all'
  counts: Record<OrderStatus, number>
  total: number
  onChange: (value: OrderStatus | 'all') => void
}

const STATUS_ORDER: OrderStatus[] = ['open', 'allocated', 'paid', 'completed']

export function StatusFilter({ value, counts, total, onChange }: StatusFilterProps) {
  const options = [
    { value: 'all' as const, label: `All · ${total}` },
    ...STATUS_ORDER.map((status) => ({
      value: status,
      label: `${ORDER_STATUS_LABELS[status]} · ${counts[status]}`,
    })),
  ]

  return (
    <>
      <div className="hidden min-w-0 flex-1 overflow-x-auto min-[900px]:block">
        <div className="inline-flex gap-0.5 rounded-xl border border-border bg-secondary p-0.5">
          <button
            type="button"
            onClick={() => onChange('all')}
            className={cn(
              'h-[30px] rounded-lg px-3 text-xs font-medium whitespace-nowrap transition-colors',
              value === 'all'
                ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            All · {total}
          </button>
          {STATUS_ORDER.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onChange(status)}
              className={cn(
                'h-[30px] rounded-lg px-3 text-xs font-medium whitespace-nowrap transition-colors',
                value === status
                  ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {ORDER_STATUS_LABELS[status]} · {counts[status]}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full min-[900px]:hidden">
        <Select
          value={value}
          onValueChange={(next) => {
            if (next) onChange(next)
          }}
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
