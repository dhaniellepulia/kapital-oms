import { useMemo, useState } from 'react'

import { SortControl } from '@/components/shared/SortControl'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { computeInvestmentFigures } from '@/features/investments/api/investmentsService'
import { useInvestorOrders } from '@/features/investments/hooks/useInvestments'
import type { SortKey } from '@/features/investments/lib/sort'
import { sortOrders } from '@/features/investments/lib/sort'
import { formatPHP } from '@/lib/format'
import { InvestorOrderCard } from '../components/InvestorOrderCard'

const ACTIVE_STATUSES = new Set(['open', 'allocated'])

export function MyOrdersPage() {
  const { user } = useAuth()
  const { data: investorOrders = [], isLoading, isError, error } = useInvestorOrders(user?.uid)
  const [sort, setSort] = useState<SortKey>('date')

  const activeOrders = investorOrders.filter((io) => ACTIVE_STATUSES.has(io.order.status))
  const sorted = useMemo(() => sortOrders(activeOrders, sort), [activeOrders, sort])

  const figures = activeOrders.map((io) => ({
    ...io,
    figures: computeInvestmentFigures(io.investment, io.order),
  }))

  const totalInvested = figures.reduce((sum, f) => sum + f.figures.investedCapital, 0)
  const projectedReturn = figures.reduce((sum, f) => sum + f.figures.expectedReturn, 0)
  const projectedProfit = figures.reduce((sum, f) => sum + f.figures.netProfit, 0)

  const stats = [
    { label: 'Total invested', value: formatPHP(totalInvested) },
    { label: 'Projected return', value: formatPHP(projectedReturn) },
    { label: 'Projected profit', value: formatPHP(projectedProfit) },
    { label: 'Active orders', value: `${activeOrders.length}` },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl tracking-tight text-foreground">My Orders</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {activeOrders.length} active orders · {formatPHP(totalInvested)} invested ·{' '}
            {formatPHP(projectedReturn)} projected return
          </p>
        </div>
        <SortControl value={sort} onChange={setSort} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-[210px] rounded-[15px] border bg-card shadow-sm" />
          ))}
        </div>
      ) : isError ? (
        <ErrorBanner
          message={error instanceof Error ? error.message : 'Failed to load your orders'}
        />
      ) : investorOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
          <p className="font-heading text-base font-medium">No orders yet</p>
          <p className="mt-1 text-xs text-muted-foreground">You have no active allocations.</p>
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
          <p className="font-heading text-base font-medium">No pending orders</p>
          <p className="mt-1 text-xs text-muted-foreground">Orders you invest in will appear here.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border bg-card p-4 shadow-sm">
                <p className="text-[10px] text-dim">{stat.label}</p>
                <p className="mt-1 font-heading text-lg font-semibold tabular-nums">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sorted.map((io) => (
              <InvestorOrderCard key={io.order.id} investment={io.investment} order={io.order} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
