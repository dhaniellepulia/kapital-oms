import { useState } from 'react'

import { FilterTabs } from '@/components/shared/FilterTabs'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useInvestorOrders } from '@/features/investments/hooks/useInvestments'
import { formatPHP } from '@/lib/format'
import { InvestorOrderCard } from '../components/InvestorOrderCard'

type OrderView = 'active' | 'completed'

const ACTIVE_STATUSES = new Set(['open', 'allocated'])
const COMPLETED_STATUSES = new Set(['paid', 'completed'])

export function MyOrdersPage() {
  const { user } = useAuth()
  const { data: investorOrders = [], isLoading, isError, error } = useInvestorOrders(user?.uid)
  const [view, setView] = useState<OrderView>('active')

  const activeOrders = investorOrders.filter((io) => ACTIVE_STATUSES.has(io.order.status))
  const completedOrders = investorOrders.filter((io) => COMPLETED_STATUSES.has(io.order.status))

  const shownOrders = view === 'active' ? activeOrders : completedOrders
  const totalInvested = shownOrders.reduce((sum, io) => sum + io.investment.investedCapital, 0)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl tracking-tight text-foreground">My Orders</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {view === 'active'
            ? `${activeOrders.length} active allocations · ${formatPHP(totalInvested)} invested`
            : `${completedOrders.length} completed allocations`}
        </p>
      </div>

      <FilterTabs
        value={view}
        onChange={setView}
        placeholder="Filter by status"
        options={[
          { value: 'active', label: 'Active', count: activeOrders.length },
          { value: 'completed', label: 'Completed', count: completedOrders.length },
        ]}
      />

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
      ) : shownOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
          <p className="font-heading text-base font-medium">
            {view === 'active' ? 'No active orders' : 'No completed orders yet'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {view === 'active'
              ? 'Orders you invest in will appear here.'
              : 'Completed orders will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shownOrders.map((io) => (
            <InvestorOrderCard key={io.order.id} investment={io.investment} order={io.order} />
          ))}
        </div>
      )}
    </div>
  )
}
