import { describe, expect, it } from 'vitest'

import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from './status'

describe('ORDER_STATUS_LABELS', () => {
  it('maps every status to its exact label', () => {
    expect(ORDER_STATUS_LABELS).toEqual({
      open: 'Open',
      allocated: 'Fully Allocated',
      paid: 'Paid',
      completed: 'Completed',
    })
  })
})

describe('ORDER_STATUS_FLOW', () => {
  it('defines the flow in the exact order', () => {
    expect(ORDER_STATUS_FLOW).toEqual(['open', 'allocated', 'paid', 'completed'])
  })
})
