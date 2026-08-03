import { FilterTabs } from '@/components/shared/FilterTabs'
import { ORDER_STATUS_LABELS } from './status'
import type { OrderStatus } from '../types'

interface StatusFilterProps {
  value: OrderStatus | 'all'
  counts: Record<OrderStatus, number>
  total: number
  onChange: (value: OrderStatus | 'all') => void
}

const STATUS_ORDER: OrderStatus[] = ['open', 'allocated', 'paid', 'completed']

export function StatusFilter({ value, counts, total, onChange }: StatusFilterProps) {
  return (
    <FilterTabs
      value={value}
      onChange={onChange}
      placeholder="Filter by status"
      options={[
        { value: 'all', label: 'All', count: total },
        ...STATUS_ORDER.map((status) => ({
          value: status,
          label: ORDER_STATUS_LABELS[status],
          count: counts[status],
        })),
      ]}
    />
  )
}
