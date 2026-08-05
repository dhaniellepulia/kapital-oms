import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { OrderStatus } from '@/features/orders/types'
import { StatusBadge } from './StatusBadge'

const EXPECTED: Record<OrderStatus, string> = {
  open: 'Open',
  allocated: 'Fully Allocated',
  paid: 'Paid',
  completed: 'Completed',
}

describe('StatusBadge', () => {
  it.each(['open', 'allocated', 'paid', 'completed'] as const)('renders the label for %s', (status) => {
    render(<StatusBadge status={status} />)

    expect(screen.getByText(EXPECTED[status])).toBeInTheDocument()
  })
})
