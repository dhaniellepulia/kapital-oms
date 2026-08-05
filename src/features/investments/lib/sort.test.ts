import { describe, expect, it } from 'vitest'

import type { Order } from '@/features/orders/types'
import type { Investment } from '../types'
import { sortOrders } from './sort'

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    orderNumber: 'ORD-1',
    itemName: 'Item',
    quantity: 1,
    capital: 100,
    sellingAmount: 150,
    grossProfit: 50,
    deliveryFee: 10,
    agentCommission: 5,
    middlemanCommission: 5,
    netProfit: 30,
    paymentDate: new Date('2026-01-01T00:00:00Z'),
    notes: '',
    status: 'open',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    createdBy: 'user-1',
    ...overrides,
  }
}

function makeInvestment(overrides: Partial<Investment> = {}): Investment {
  return {
    orderId: 'order-1',
    userId: 'user-1',
    investorName: 'Alice',
    investedCapital: 100,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  }
}

function makeInvestorOrder(
  orderOverrides: Partial<Order> = {},
  investmentOverrides: Partial<Investment> = {},
): { investment: Investment; order: Order } {
  return { order: makeOrder(orderOverrides), investment: makeInvestment(investmentOverrides) }
}

describe('sortOrders', () => {
  it('does not mutate the input array', () => {
    const input = [
      makeInvestorOrder({ id: 'a' }, { investedCapital: 100 }),
      makeInvestorOrder({ id: 'b' }, { investedCapital: 300 }),
      makeInvestorOrder({ id: 'c' }, { investedCapital: 200 }),
    ]
    const original = input.map((item) => item.order.id)

    sortOrders(input, 'amount')

    expect(input.map((item) => item.order.id)).toEqual(original)
  })

  it('returns a new array', () => {
    const input = [makeInvestorOrder()]
    const result = sortOrders(input, 'amount')
    expect(result).not.toBe(input)
  })

  it('sorts by amount descending', () => {
    const input = [
      makeInvestorOrder({ id: 'a' }, { investedCapital: 100 }),
      makeInvestorOrder({ id: 'b' }, { investedCapital: 300 }),
      makeInvestorOrder({ id: 'c' }, { investedCapital: 200 }),
    ]

    const result = sortOrders(input, 'amount')

    expect(result.map((item) => item.order.id)).toEqual(['b', 'c', 'a'])
  })

  it('sorts by date descending', () => {
    const input = [
      makeInvestorOrder(
        { id: 'a', createdAt: new Date('2026-01-01T00:00:00Z') },
        { createdAt: new Date('2026-01-01T00:00:00Z') },
      ),
      makeInvestorOrder(
        { id: 'b', createdAt: new Date('2026-01-03T00:00:00Z') },
        { createdAt: new Date('2026-01-03T00:00:00Z') },
      ),
      makeInvestorOrder(
        { id: 'c', createdAt: new Date('2026-01-02T00:00:00Z') },
        { createdAt: new Date('2026-01-02T00:00:00Z') },
      ),
    ]

    const result = sortOrders(input, 'date')

    expect(result.map((item) => item.order.id)).toEqual(['b', 'c', 'a'])
  })

  it('returns an empty array for empty input', () => {
    const result = sortOrders([], 'amount')
    expect(result).toEqual([])
  })
})
