import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAllInvestments } from '@/features/investments/hooks/useInvestments'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { ORDER_STATUSES, type Order, type OrderStatus } from '@/features/orders/types'
import { formatDate, formatPercent, formatPHP } from '@/lib/format'
import { buildDashboardStats, type InvestorStat, type OrderFunding } from '../lib/dashboardStats'

export function DashboardPage() {
  const ordersQuery = useOrders()
  const investmentsQuery = useAllInvestments()

  const stats = useMemo(
    () => buildDashboardStats(ordersQuery.data ?? [], investmentsQuery.data ?? []),
    [ordersQuery.data, investmentsQuery.data],
  )

  if (ordersQuery.isLoading || investmentsQuery.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-[210px] rounded-[15px] border bg-card shadow-sm" />
        ))}
      </div>
    )
  }

  if (ordersQuery.isError || investmentsQuery.isError) {
    const message =
      (ordersQuery.error instanceof Error && ordersQuery.error.message) ||
      (investmentsQuery.error instanceof Error && investmentsQuery.error.message) ||
      'Failed to load dashboard data'
    return <ErrorBanner message={message} />
  }

  if (stats.orderCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
        <p className="font-heading text-base font-medium">No orders yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create an order to see dashboard insights.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {stats.orderCount} orders · {formatPHP(stats.totalOffered)} capital offered
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Capital raised"
          value={formatPHP(stats.totalRaised)}
          sub={`of ${formatPHP(stats.totalOffered)} offered`}
        />
        <KpiCard
          label="Funding rate"
          value={formatPercent(stats.fundingRate)}
          sub={`${stats.orderCount} total orders`}
        />
        <KpiCard
          label="Projected gross"
          value={formatPHP(stats.grossProfit)}
          sub={`${formatPHP(stats.netProfit)} net profit`}
        />
        <KpiCard
          label="Pending payouts"
          value={formatPHP(stats.pendingValue)}
          sub={`${stats.pendingCount} investments · ${stats.pendingOrderCount} orders`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Orders by status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {ORDER_STATUSES.map((status) => (
              <StatusRow
                key={status}
                status={status}
                count={stats.statusCounts[status]}
                orderCount={stats.orderCount}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funding progress</CardTitle>
            <CardAction>
              <Link
                to="/admin/orders"
                className="text-[10.5px] text-muted-foreground hover:text-foreground"
              >
                View all orders
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {stats.funding.length === 0 ? (
              <p className="text-xs text-muted-foreground">No open or partially funded orders.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {stats.funding.slice(0, 4).map((fund) => (
                  <FundingRow key={fund.order.id} fund={fund} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top investors</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topInvestors.length === 0 ? (
              <p className="text-xs text-muted-foreground">No investors yet.</p>
            ) : (
              <div className="flex flex-col gap-3.5">
                {stats.topInvestors.map((investor) => (
                  <InvestorRow key={investor.investorName} investor={investor} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="text-xs text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {stats.recentOrders.map((order) => (
                <RecentOrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-[10px] text-dim">{label}</p>
      <p className="mt-1 font-heading text-lg font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[10.5px] text-muted-foreground">{sub}</p>
    </div>
  )
}

function StatusRow({
  status,
  count,
  orderCount,
}: {
  status: OrderStatus
  count: number
  orderCount: number
}) {
  const ratio = orderCount > 0 ? count / orderCount : 0
  return (
    <div>
      <div className="flex items-center justify-between">
        <StatusBadge status={status} />
        <span className="text-xs font-medium tabular-nums">{count}</span>
      </div>
      <ProgressBar value={ratio} className="mt-2" />
    </div>
  )
}

function FundingRow({ fund }: { fund: OrderFunding }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-foreground">{fund.order.itemName}</p>
          <p className="text-[11px] text-dim">Order #{fund.order.orderNumber}</p>
        </div>
        <p className="shrink-0 text-[11px] text-dim tabular-nums">
          {formatPHP(fund.invested)} of {formatPHP(fund.offered)}
        </p>
      </div>
      <ProgressBar value={fund.ratio} complete={fund.ratio >= 1} className="mt-2" />
    </div>
  )
}

function InvestorRow({ investor }: { investor: InvestorStat }) {
  return (
    <div className="flex items-center gap-2.5">
      <UserAvatar name={investor.investorName} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground">{investor.investorName}</p>
        {investor.investorEmail && (
          <p className="truncate text-[10.5px] text-dim">{investor.investorEmail}</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-[12px] font-medium tabular-nums">{formatPHP(investor.invested)}</p>
        <p className="text-[10.5px] text-dim tabular-nums">{formatPercent(investor.ratio, 0)}</p>
      </div>
    </div>
  )
}

function RecentOrderRow({ order }: { order: Order }) {
  return (
    <Link to={`/admin/orders/${order.id}`} className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-foreground">{order.itemName}</p>
        <p className="text-[11px] text-dim">Order #{order.orderNumber}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={order.status} />
        <span className="text-[12px] font-medium tabular-nums">
          {formatPHP(order.capital * order.quantity)}
        </span>
        <span className="w-20 text-right text-[10.5px] text-dim tabular-nums">
          {formatDate(order.createdAt)}
        </span>
      </div>
    </Link>
  )
}
