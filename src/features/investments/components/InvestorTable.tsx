import { useState } from 'react'
import { Trash2Icon } from 'lucide-react'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  computeInvestmentFigures,
  isGuestInvestment,
} from '@/features/investments/api/investmentsService'
import { useRemoveInvestor } from '@/features/investments/hooks/useInvestments'
import type { Investment } from '@/features/investments/types'
import type { Order } from '@/features/orders/types'
import { formatPercent, formatPHP } from '@/lib/format'

interface InvestorTableProps {
  order: Order
  investments: Investment[]
}

export function InvestorTable({ order, investments }: InvestorTableProps) {
  const removeInvestor = useRemoveInvestor()
  const [removing, setRemoving] = useState<string | null>(null)

  async function handleRemove(userId: string) {
    setRemoving(userId)
    try {
      await removeInvestor.mutateAsync({ orderId: order.id, userId })
    } finally {
      setRemoving(null)
    }
  }

  if (investments.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-muted-foreground">No investors assigned yet.</p>
        <p className="mt-1 text-xs text-dim">Assign investors to fund this order's capital.</p>
      </div>
    )
  }

  const removingInvestment = investments.find((inv) => inv.userId === removing)

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Investor</TableHead>
              <TableHead className="text-right">Invested Capital</TableHead>
              <TableHead>Investment %</TableHead>
              <TableHead className="text-right">Expected Profit</TableHead>
              <TableHead className="text-right">Expected Return</TableHead>
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.map((investment) => {
              const figures = computeInvestmentFigures(investment, order)
              return (
                <TableRow key={investment.userId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar name={investment.investorName} size="sm" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[13px] font-medium">{investment.investorName}</p>
                          {isGuestInvestment(investment) && <GuestBadge />}
                        </div>
                        {investment.investorEmail && (
                          <p className="text-[11px] text-dim">{investment.investorEmail}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatPHP(investment.investedCapital)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-[5px] w-20 overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${figures.ratio * 100}%` }}
                        />
                      </div>
                      <b className="min-w-11 text-right text-[12.5px] font-medium tabular-nums">
                        {formatPercent(figures.ratio)}
                      </b>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-positive tabular-nums">
                    {formatPHP(figures.netProfit)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPHP(figures.expectedReturn)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setRemoving(investment.userId)}
                    >
                      <Trash2Icon />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col divide-y md:hidden">
        {investments.map((investment) => {
          const figures = computeInvestmentFigures(investment, order)
          return (
            <div key={investment.userId} className="p-4">
              <div className="flex items-center gap-3">
                <UserAvatar name={investment.investorName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[13px] font-medium">{investment.investorName}</p>
                    {isGuestInvestment(investment) && <GuestBadge />}
                  </div>
                  {investment.investorEmail && (
                    <p className="truncate text-[11px] text-dim">{investment.investorEmail}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setRemoving(investment.userId)}
                >
                  <Trash2Icon />
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[12.5px]">
                <div>
                  <p className="text-[11px] text-muted-foreground">Invested Capital</p>
                  <p className="mt-0.5 font-medium tabular-nums">{formatPHP(investment.investedCapital)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Investment %</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-[5px] w-14 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${figures.ratio * 100}%` }}
                      />
                    </div>
                    <span className="text-[12px] font-medium tabular-nums">
                      {formatPercent(figures.ratio)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Expected Profit</p>
                  <p className="mt-0.5 font-medium text-positive tabular-nums">
                    {formatPHP(figures.netProfit)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Expected Return</p>
                  <p className="mt-0.5 font-medium tabular-nums">{formatPHP(figures.expectedReturn)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open) setRemoving(null)
        }}
        title="Remove investor?"
        description={
          removingInvestment ? `Remove ${removingInvestment.investorName} from this order?` : undefined
        }
        confirmLabel="Remove"
        destructive
        isPending={removing !== null && removeInvestor.isPending}
        onConfirm={() => {
          if (removing) void handleRemove(removing)
        }}
      />
    </>
  )
}

function GuestBadge() {
  return (
    <span className="shrink-0 rounded-full border bg-background px-2 py-px text-[9px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
      Other
    </span>
  )
}
