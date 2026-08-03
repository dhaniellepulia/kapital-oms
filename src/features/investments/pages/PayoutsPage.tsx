import { useState } from 'react'

import { FilterTabs } from '@/components/shared/FilterTabs'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { computeInvestmentFigures } from '@/features/investments/api/investmentsService'
import { useInvestorOrders } from '@/features/investments/hooks/useInvestments'
import type { InvestorOrder } from '@/features/investments/types'
import { formatPHP } from '@/lib/format'
import { PayoutCard } from '../components/PayoutCard'

const PAID_STATUSES = new Set(['paid', 'completed'])
const UPCOMING_STATUSES = new Set(['open', 'allocated'])

type PayoutView = 'paidout' | 'upcoming'

export function PayoutsPage() {
  const { user } = useAuth()
  const { data: investorOrders = [], isLoading, isError, error } = useInvestorOrders(user?.uid)
  const [view, setView] = useState<PayoutView>('paidout')

  const figures = investorOrders.map((io) => ({
    ...io,
    figures: computeInvestmentFigures(io.investment, io.order),
  }))

  const totalInvested = figures.reduce((sum, f) => sum + f.figures.investedCapital, 0)
  const totalExpectedReturn = figures.reduce((sum, f) => sum + f.figures.expectedReturn, 0)
  const paidOut = figures
    .filter((f) => PAID_STATUSES.has(f.order.status))
    .reduce((sum, f) => sum + f.figures.expectedReturn, 0)
  const upcomingCount = figures.filter((f) => UPCOMING_STATUSES.has(f.order.status)).length

  const paidOutOrders = investorOrders.filter((io) => PAID_STATUSES.has(io.order.status))
  const upcomingOrders = investorOrders.filter((io) => UPCOMING_STATUSES.has(io.order.status))
  const shownOrders = view === 'paidout' ? paidOutOrders : upcomingOrders

  const stats = [
    { label: 'Total invested', value: formatPHP(totalInvested) },
    { label: 'Expected return', value: formatPHP(totalExpectedReturn) },
    { label: 'Paid out', value: formatPHP(paidOut) },
    { label: 'Upcoming', value: `${upcomingCount} orders` },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl tracking-tight text-foreground">Payouts</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {investorOrders.length} payout records · {formatPHP(totalExpectedReturn)} expected
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-[210px] rounded-[15px] border bg-card shadow-sm" />
          ))}
        </div>
      ) : isError ? (
        <ErrorBanner message={error instanceof Error ? error.message : 'Failed to load your payouts'} />
      ) : investorOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
          <p className="font-heading text-base font-medium">No payouts yet</p>
          <p className="mt-1 text-xs text-muted-foreground">You have no payout records.</p>
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

          <FilterTabs
            value={view}
            onChange={setView}
            placeholder="Filter by payout status"
            options={[
              { value: 'paidout', label: 'Paid out', count: paidOutOrders.length },
              { value: 'upcoming', label: 'Upcoming', count: upcomingOrders.length },
            ]}
          />

          {shownOrders.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {view === 'paidout' ? 'No paid-out allocations yet.' : 'No upcoming payouts yet.'}
            </p>
          ) : (
            <PayoutGrid orders={shownOrders} />
          )}
        </>
      )}
    </div>
  )
}

function PayoutGrid({ orders }: { orders: InvestorOrder[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {orders.map((io) => (
        <PayoutCard key={io.order.id} payout={io} />
      ))}
    </div>
  )
}
