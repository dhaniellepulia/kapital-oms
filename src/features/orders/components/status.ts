import type { OrderStatus } from '../types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  open: 'Open',
  allocated: 'Fully Allocated',
  paid: 'Paid',
  completed: 'Completed',
}

export const ORDER_STATUS_FLOW: OrderStatus[] = ['open', 'allocated', 'paid', 'completed']
