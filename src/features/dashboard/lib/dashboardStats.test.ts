import { describe, expect, it } from 'vitest'

import type { Investment } from '@/features/investments/types'
import type { Order } from '@/features/orders/types'
import { buildDashboardStats } from './dashboardStats'

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    orderNumber: 'ORD-1',
    itemName: 'Item 1',
    quantity: 1,
    capital: 100,
    sellingAmount: 150,
    grossProfit: 50,
    deliveryFee: 10,
    agentCommission: 5,
    middlemanCommission: 5,
    netProfit: 30,
    paymentDate: new Date('2026-01-05T00:00:00Z'),
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
    userId: 'investor-1',
    investorName: 'Alice',
    investorEmail: 'alice@example.com',
    investedCapital: 100,
    createdAt: new Date('2026-01-02T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides,
  }
}

const orders = [
  makeOrder({
    id: 'order-1',
    capital: 1000,
    quantity: 3,
    grossProfit: 300,
    netProfit: 150,
    status: 'open',
    createdAt: new Date('2026-01-10T00:00:00Z'),
  }),
  makeOrder({
    id: 'order-2',
    capital: 500,
    quantity: 2,
    grossProfit: 120,
    netProfit: 60,
    status: 'allocated',
    createdAt: new Date('2026-01-20T00:00:00Z'),
  }),
  makeOrder({
    id: 'order-3',
    capital: 200,
    quantity: 1,
    grossProfit: 40,
    netProfit: 20,
    status: 'paid',
    createdAt: new Date('2026-01-15T00:00:00Z'),
  }),
  makeOrder({
    id: 'order-4',
    capital: 100,
    quantity: 5,
    grossProfit: 30,
    netProfit: 10,
    status: 'completed',
    createdAt: new Date('2026-01-05T00:00:00Z'),
  }),
]

const investments = [
  makeInvestment({ orderId: 'order-1', userId: 'investor-1', investorName: 'Alice', investedCapital: 600 }),
  makeInvestment({ orderId: 'order-1', userId: 'investor-2', investorName: 'Bob', investedCapital: 400 }),
  makeInvestment({ orderId: 'order-2', userId: 'investor-3', investorName: 'Carol', investedCapital: 1000 }),
  makeInvestment({ orderId: 'order-3', userId: 'investor-1', investorName: 'Alice', investedCapital: 200 }),
  makeInvestment({ orderId: 'order-4', userId: 'investor-4', investorName: 'Dave', investedCapital: 50 }),
]

describe('buildDashboardStats', () => {
  it('returns all-zero/empty stats for empty inputs', () => {
    const stats = buildDashboardStats([], [])

    expect(stats.totalRaised).toBe(0)
    expect(stats.totalOffered).toBe(0)
    expect(stats.fundingRate).toBe(0)
    expect(stats.orderCount).toBe(0)
    expect(stats.statusCounts).toEqual({ open: 0, allocated: 0, paid: 0, completed: 0 })
    expect(stats.grossProfit).toBe(0)
    expect(stats.netProfit).toBe(0)
    expect(stats.pendingCount).toBe(0)
    expect(stats.pendingValue).toBe(0)
    expect(stats.pendingOrderCount).toBe(0)
    expect(stats.funding).toEqual([])
    expect(stats.topInvestors).toEqual([])
    expect(stats.recentOrders).toEqual([])
  })

  it('sums raised, offered, profits and counts statuses', () => {
    const stats = buildDashboardStats(orders, investments)

    expect(stats.totalRaised).toBe(2250)
    expect(stats.totalOffered).toBe(4700)
    expect(stats.fundingRate).toBeCloseTo(2250 / 4700)
    expect(stats.orderCount).toBe(4)
    expect(stats.statusCounts).toEqual({ open: 1, allocated: 1, paid: 1, completed: 1 })
    expect(stats.grossProfit).toBe(490)
    expect(stats.netProfit).toBe(240)
  })

  it('computes pending stats only for open or allocated orders', () => {
    const stats = buildDashboardStats(orders, investments)

    const pendingInvestments = investments.filter((inv) => {
      const order = orders.find((o) => o.id === inv.orderId)
      return order !== undefined && (order.status === 'open' || order.status === 'allocated')
    })

    expect(stats.pendingCount).toBe(3)
    expect(stats.pendingOrderCount).toBe(2)

    const expectedValue = pendingInvestments.reduce((sum, inv) => {
      const order = orders.find((o) => o.id === inv.orderId)!
      const offered = order.capital * order.quantity
      const ratio = offered > 0 ? inv.investedCapital / offered : 0
      return sum + inv.investedCapital + order.netProfit * ratio
    }, 0)

    expect(stats.pendingValue).toBeCloseTo(expectedValue)
    expect(stats.pendingValue).toBeCloseTo(2110)
  })

  it('builds funding for open and allocated orders sorted by ratio ascending', () => {
    const stats = buildDashboardStats(orders, investments)

    expect(stats.funding.map((f) => f.order.id)).toEqual(['order-1', 'order-2'])

    const [first, second] = stats.funding
    expect(first.invested).toBe(1000)
    expect(first.offered).toBe(3000)
    expect(first.ratio).toBeCloseTo(1000 / 3000)
    expect(second.invested).toBe(1000)
    expect(second.offered).toBe(1000)
    expect(second.ratio).toBeCloseTo(1)
  })

  it('uses a zero funding ratio when offered is zero', () => {
    const zeroOrder = makeOrder({
      id: 'zero',
      capital: 0,
      quantity: 5,
      netProfit: 100,
      status: 'open',
      createdAt: new Date('2026-01-03T00:00:00Z'),
    })
    const inv = makeInvestment({ orderId: 'zero', investedCapital: 50 })

    const stats = buildDashboardStats([zeroOrder], [inv])

    expect(stats.funding[0].offered).toBe(0)
    expect(stats.funding[0].ratio).toBe(0)
    expect(stats.pendingCount).toBe(1)
    expect(stats.pendingValue).toBeCloseTo(50)
  })

  it('groups top investors by user and sorts by total invested descending', () => {
    const stats = buildDashboardStats(orders, investments)

    expect(stats.topInvestors.map((i) => i.investorName)).toEqual(['Carol', 'Alice', 'Bob', 'Dave'])
    expect(stats.topInvestors.map((i) => i.invested)).toEqual([1000, 800, 400, 50])
    expect(stats.topInvestors[0].ratio).toBeCloseTo(1000 / 2250)
    expect(stats.topInvestors[1].ratio).toBeCloseTo(800 / 2250)
    expect(stats.topInvestors[2].ratio).toBeCloseTo(400 / 2250)
    expect(stats.topInvestors[3].ratio).toBeCloseTo(50 / 2250)
  })

  it('limits top investors to the five largest', () => {
    const ordersForInvestors = [
      makeOrder({ id: 'o', capital: 100, quantity: 1, status: 'open', createdAt: new Date('2026-01-01T00:00:00Z') }),
    ]
    const manyInvestors = Array.from({ length: 7 }, (_, i) =>
      makeInvestment({
        userId: `user-${i}`,
        investorName: `Investor ${i}`,
        investedCapital: (i + 1) * 10,
      }),
    )

    const stats = buildDashboardStats(ordersForInvestors, manyInvestors)

    expect(stats.topInvestors).toHaveLength(5)
    expect(stats.topInvestors.map((i) => i.invested)).toEqual([70, 60, 50, 40, 30])
  })

  it('sorts recent orders by createdAt descending and limits to eight', () => {
    const manyOrders = Array.from({ length: 10 }, (_, i) =>
      makeOrder({
        id: `order-${i}`,
        createdAt: new Date(2026, 0, i + 1, 0, 0, 0),
        status: 'completed',
      }),
    )

    const stats = buildDashboardStats(manyOrders, [])

    expect(stats.recentOrders).toHaveLength(8)
    expect(stats.recentOrders.map((o) => o.id)).toEqual([
      'order-9',
      'order-8',
      'order-7',
      'order-6',
      'order-5',
      'order-4',
      'order-3',
      'order-2',
    ])
  })

  it('sorts recent orders across the mixed fixture newest first', () => {
    const stats = buildDashboardStats(orders, investments)

    expect(stats.recentOrders.map((o) => o.id)).toEqual(['order-2', 'order-3', 'order-1', 'order-4'])
  })
})
