import { ArrowLeftIcon } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { computeInvestmentFigures } from '@/features/investments/api/investmentsService'
import { useInvestmentsByUser } from '@/features/investments/hooks/useInvestments'
import { useOrder } from '@/features/orders/hooks/useOrders'
import { formatDate, formatPercent, formatPHP } from '@/lib/format'

export function UserOrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const {
    data: order,
    isLoading: orderLoading,
    isError,
  } = useOrder(id)
  const { data: investments, isLoading: investmentsLoading } = useInvestmentsByUser(user?.uid)

  const investment = investments?.find((inv) => inv.orderId === id)

  if (orderLoading || investmentsLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-72" />
        <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col gap-5">
        <ErrorBanner message="Order not found or you don't have access." />
      </div>
    )
  }

  if (!investment) {
    return (
      <div className="flex flex-col gap-5">
        <ErrorBanner message="You don't have an allocation in this order." />
      </div>
    )
  }

  const figures = computeInvestmentFigures(investment, order)

  return (
    <div className="flex flex-col gap-5">
      <Link
        to="/my-orders"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        My Orders
      </Link>

      <div className="mb-1 flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-[23px] font-semibold tracking-tight">{order.itemName}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="text-xs text-muted-foreground">
        Order #{order.orderNumber} · Payment due {formatDate(order.paymentDate)}
      </p>

      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="px-5 pb-1 pt-5">
              <h2 className="font-heading text-[15px] font-semibold">Order Information</h2>
            </div>
            <div className="px-5 pb-2">
              <div className="flex items-center justify-between gap-3 border-b border-border py-[11px] text-[12.5px]">
                <span className="text-muted-foreground">Item</span>
                <b className="text-right font-medium tabular-nums">{order.itemName}</b>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border py-[11px] text-[12.5px]">
                <span className="text-muted-foreground">Quantity</span>
                <b className="text-right font-medium tabular-nums">{order.quantity} units</b>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border py-[11px] text-[12.5px]">
                <span className="text-muted-foreground">Capital per piece</span>
                <b className="text-right font-medium tabular-nums">{formatPHP(order.capital)}</b>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border py-[11px] text-[12.5px]">
                <span className="text-muted-foreground">Selling price per piece</span>
                <b className="text-right font-medium tabular-nums">
                  {formatPHP(order.sellingAmount)}
                </b>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border py-[11px] text-[12.5px]">
                <span className="text-muted-foreground">Payment date</span>
                <b className="text-right font-medium tabular-nums">{formatDate(order.paymentDate)}</b>
              </div>
              <div className="flex items-center justify-between gap-3 border-0 py-[11px] text-[12.5px]">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={order.status} />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="px-5 pb-1 pt-5">
              <h2 className="font-heading text-[15px] font-semibold">Financial Breakdown</h2>
            </div>
            <div className="px-5 pb-2">
              <div className="flex items-center justify-between gap-3 border-b border-border py-[11px] text-[12.5px]">
                <span className="text-muted-foreground">Total Capital</span>
                <b className="text-right font-medium tabular-nums">
                  {formatPHP(order.capital * order.quantity)}
                </b>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border py-[11px] text-[12.5px]">
                <span className="text-muted-foreground">Total Selling</span>
                <b className="text-right font-medium tabular-nums">
                  {formatPHP(order.sellingAmount * order.quantity)}
                </b>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border py-[11px] text-[12.5px]">
                <span className="text-muted-foreground">Gross Profit</span>
                <b className="text-right font-medium tabular-nums text-positive">
                  {formatPHP(order.grossProfit)}
                </b>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border py-[11px] text-[12.5px]">
                <span className="text-muted-foreground">Delivery Fee</span>
                <b className="text-right font-medium tabular-nums">− {formatPHP(order.deliveryFee)}</b>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border py-[11px] text-[12.5px]">
                <span className="text-muted-foreground">Agent Commission</span>
                <b className="text-right font-medium tabular-nums">
                  − {formatPHP(order.agentCommission)}
                </b>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border py-[11px] text-[12.5px]">
                <span className="text-muted-foreground">Middleman Commission</span>
                <b className="text-right font-medium tabular-nums">
                  − {formatPHP(order.middlemanCommission)}
                </b>
              </div>
              <div className="flex items-center justify-between gap-3 border-0 py-[11px] text-[12.5px]">
                <span className="text-muted-foreground">Net Profit</span>
                <b className="text-right font-medium tabular-nums">{formatPHP(order.netProfit)}</b>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-[15px] font-semibold">My Investment</h2>
            <span className="rounded-full border bg-background px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Read-only
            </span>
          </div>

          <div className="px-0">
            <div className="flex items-center justify-between gap-3 border-b border-border py-[11px] text-[12.5px]">
              <span className="text-muted-foreground">Capital invested</span>
              <b className="text-right font-medium tabular-nums">
                {formatPHP(investment.investedCapital)}
              </b>
            </div>
            <div className="flex items-center justify-between gap-3 border-0 py-[11px] text-[12.5px]">
              <span className="text-muted-foreground">Investment share</span>
              <b className="text-right font-medium tabular-nums">{formatPercent(figures.ratio)}</b>
            </div>
          </div>

          <ProgressBar value={figures.ratio} className="my-2.5" />

          <div className="flex flex-col gap-1 rounded-xl border border-border bg-popover p-4">
            <span className="text-[11px] tracking-[0.03em] text-dim">Expected Return</span>
            <b className="font-heading text-[26px] font-semibold tabular-nums">
              {formatPHP(figures.expectedReturn)}
            </b>
            <span className="text-[11px] text-muted-foreground">
              Capital {formatPHP(figures.investedCapital)} + expected profit
            </span>
          </div>

          <div className="mt-2.5 px-0">
            <div className="flex items-center justify-between gap-3 border-b border-border py-[11px] text-[12.5px]">
              <span className="text-muted-foreground">Expected Profit</span>
              <b className="text-right font-medium tabular-nums text-positive">
                {formatPHP(figures.netProfit)}
              </b>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-border py-[11px] text-[12.5px]">
              <span className="text-muted-foreground">Payment date</span>
              <b className="text-right font-medium tabular-nums">{formatDate(order.paymentDate)}</b>
            </div>
            <div className="flex items-center justify-between gap-3 border-0 py-[11px] text-[12.5px]">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
