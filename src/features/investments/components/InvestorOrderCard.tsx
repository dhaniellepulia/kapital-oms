import { ArrowUpRightIcon, PackageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { StatusBadge } from '@/components/shared/StatusBadge'
import { computeInvestmentFigures } from '@/features/investments/api/investmentsService'
import type { Investment } from '@/features/investments/types'
import type { Order } from '@/features/orders/types'
import { formatDate, formatPercent, formatPHP } from '@/lib/format'

interface InvestorOrderCardProps {
  investment: Investment
  order: Order
}

export function InvestorOrderCard({ investment, order }: InvestorOrderCardProps) {
  const figures = computeInvestmentFigures(investment, order)

  return (
    <div className="flex flex-col gap-3.5 rounded-[15px] border border-border bg-card p-[18px_18px_15px] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-soft text-[#2446b5]">
            <PackageIcon className="size-[17px]" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-foreground">{order.itemName}</p>
            <p className="text-[11px] text-dim">Qty {order.quantity}</p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex min-w-0 flex-col gap-1 rounded-[10px] bg-secondary p-2.5">
          <span className="text-[10px] text-dim">Capital invested</span>
          <b className="text-[12.5px] font-medium tabular-nums">
            {formatPHP(investment.investedCapital)}
          </b>
        </div>
        <div className="flex min-w-0 flex-col gap-1 rounded-[10px] bg-secondary p-2.5">
          <span className="text-[10px] text-dim">Your share</span>
          <b className="text-[12.5px] font-medium tabular-nums">{formatPercent(figures.ratio)}</b>
        </div>
        <div className="flex min-w-0 flex-col gap-1 rounded-[10px] bg-secondary p-2.5">
          <span className="text-[10px] text-dim">Expected profit</span>
          <b className="text-[12.5px] font-medium tabular-nums text-positive">
            {formatPHP(figures.netProfit)}
          </b>
        </div>
      </div>

      <div className="h-[5px] overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(figures.ratio * 100, 100)}%` }}
        />
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-border pt-3">
        <div>
          <span className="block text-[10px] tracking-[0.03em] text-dim">Expected return</span>
          <b className="font-heading text-[17px] font-semibold tabular-nums">
            {formatPHP(figures.expectedReturn)}
          </b>
        </div>
        <div className="text-right">
          <span className="block text-[10.5px] text-dim">Payment</span>
          <b className="block text-[11px] font-medium text-muted-foreground tabular-nums">
            {formatDate(order.paymentDate)}
          </b>
          <Link
            to={`/my-orders/${order.id}`}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary"
          >
            View <ArrowUpRightIcon className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
