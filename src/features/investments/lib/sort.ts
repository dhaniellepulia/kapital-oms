import type { InvestorOrder } from '../types'

export type SortKey = 'date' | 'amount'

export function sortOrders(orders: InvestorOrder[], sort: SortKey): InvestorOrder[] {
  const sorted = [...orders]
  if (sort === 'amount') {
    sorted.sort((a, b) => b.investment.investedCapital - a.investment.investedCapital)
  } else {
    sorted.sort((a, b) => b.order.createdAt.getTime() - a.order.createdAt.getTime())
  }
  return sorted
}
