import { investmentRatio } from '@/lib/calculations'
import type { Order, OrderStatus } from '@/features/orders/types'
import type { Investment } from '@/features/investments/types'

export interface OrderFunding {
  order: Order
  invested: number
  offered: number
  ratio: number
}

export interface InvestorStat {
  investorName: string
  investorEmail?: string
  invested: number
  ratio: number
}

export interface DashboardStats {
  totalRaised: number
  totalOffered: number
  fundingRate: number
  orderCount: number
  statusCounts: Record<OrderStatus, number>
  grossProfit: number
  netProfit: number
  pendingCount: number
  pendingValue: number
  pendingOrderCount: number
  funding: OrderFunding[]
  topInvestors: InvestorStat[]
  recentOrders: Order[]
}

function isOpenOrAllocated(order: Order): boolean {
  return order.status === 'open' || order.status === 'allocated'
}

export function buildDashboardStats(orders: Order[], investments: Investment[]): DashboardStats {
  const totalRaised = investments.reduce((sum, inv) => sum + inv.investedCapital, 0)
  const totalOffered = orders.reduce((sum, order) => sum + order.capital * order.quantity, 0)
  const fundingRate = totalOffered > 0 ? totalRaised / totalOffered : 0
  const orderCount = orders.length

  const statusCounts: Record<OrderStatus, number> = {
    open: 0,
    allocated: 0,
    paid: 0,
    completed: 0,
  }
  for (const order of orders) statusCounts[order.status] += 1

  const grossProfit = orders.reduce((sum, order) => sum + order.grossProfit, 0)
  const netProfit = orders.reduce((sum, order) => sum + order.netProfit, 0)

  const orderById = new Map(orders.map((order) => [order.id, order]))
  const investedByOrder = new Map<string, number>()
  for (const inv of investments) {
    investedByOrder.set(inv.orderId, (investedByOrder.get(inv.orderId) ?? 0) + inv.investedCapital)
  }

  let pendingCount = 0
  let pendingValue = 0
  const pendingOrderIds = new Set<string>()
  for (const inv of investments) {
    const order = orderById.get(inv.orderId)
    if (!order || !isOpenOrAllocated(order)) continue
    const offered = order.capital * order.quantity
    const expectedReturn =
      inv.investedCapital + order.netProfit * investmentRatio(inv.investedCapital, offered)
    pendingCount += 1
    pendingValue += expectedReturn
    pendingOrderIds.add(order.id)
  }

  const funding = orders
    .filter(isOpenOrAllocated)
    .map((order) => {
      const offered = order.capital * order.quantity
      const invested = investedByOrder.get(order.id) ?? 0
      return { order, invested, offered, ratio: offered > 0 ? invested / offered : 0 }
    })
    .sort((a, b) => a.ratio - b.ratio)

  const investorMap = new Map<string, InvestorStat>()
  for (const inv of investments) {
    const existing = investorMap.get(inv.userId)
    if (existing) {
      existing.invested += inv.investedCapital
    } else {
      investorMap.set(inv.userId, {
        investorName: inv.investorName,
        investorEmail: inv.investorEmail,
        invested: inv.investedCapital,
        ratio: 0,
      })
    }
  }
  const topInvestors = [...investorMap.values()]
    .map((stat) => ({ ...stat, ratio: totalRaised > 0 ? stat.invested / totalRaised : 0 }))
    .sort((a, b) => b.invested - a.invested)
    .slice(0, 5)

  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8)

  return {
    totalRaised,
    totalOffered,
    fundingRate,
    orderCount,
    statusCounts,
    grossProfit,
    netProfit,
    pendingCount,
    pendingValue,
    pendingOrderCount: pendingOrderIds.size,
    funding,
    topInvestors,
    recentOrders,
  }
}
