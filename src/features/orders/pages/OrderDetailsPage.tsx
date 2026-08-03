import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeftIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { computeInvestmentFigures } from '@/features/investments/api/investmentsService'
import { AssignInvestorModal } from '@/features/investments/components/AssignInvestorModal'
import { InvestorTable } from '@/features/investments/components/InvestorTable'
import { useInvestmentsByOrder } from '@/features/investments/hooks/useInvestments'
import { OrderFormModal } from '@/features/orders/components/OrderFormModal'
import { deleteOrder } from '@/features/orders/api/ordersService'
import { useOrder, useUpdateOrderStatus } from '@/features/orders/hooks/useOrders'
import { ORDER_STATUSES, type OrderStatus } from '@/features/orders/types'
import { formatDate, formatPercent, formatPHP } from '@/lib/format'

const STATUS_LABELS: Record<OrderStatus, string> = {
  open: 'Open',
  allocated: 'Fully Allocated',
  paid: 'Paid',
  completed: 'Completed',
}

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: order, isLoading, isError } = useOrder(id)
  const { data: investments = [] } = useInvestmentsByOrder(id)
  const updateStatus = useUpdateOrderStatus()

  const [editOpen, setEditOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState('')

  async function handleStatusChange(status: OrderStatus) {
    if (!order || status === order.status) return
    try {
      await updateStatus.mutateAsync({ id: order.id, status })
      setActionError('')
    } catch {
      setActionError('Failed to update the order status.')
    }
  }

  async function handleDelete() {
    if (!order) return
    setDeleting(true)
    try {
      await deleteOrder(order.id)
      navigate('/admin/orders')
    } catch {
      setActionError('Failed to delete this order.')
      setDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-72" />
        <div className="grid gap-4 md:grid-cols-[1.55fr_1fr]">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-5">
        <ErrorBanner message="Failed to load this order." />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col gap-5">
        <ErrorBanner message="Order not found." />
      </div>
    )
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.investedCapital, 0)
  const totalCapital = order.capital * order.quantity
  const fundedRatio = totalCapital > 0 ? Math.min(totalInvested / totalCapital, 1) : 0
  const fundedPct = fundedRatio * 100
  const expectedPayouts = investments.reduce(
    (sum, inv) => sum + computeInvestmentFigures(inv, order).expectedReturn,
    0,
  )
  const fullyCovered = fundedRatio >= 1

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8">
      <Link
        to="/admin/orders"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        Orders
      </Link>

      {actionError && <ErrorBanner message={actionError} />}

      <div className="mb-1 flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-[23px] font-semibold tracking-tight">{order.itemName}</h1>
        <StatusBadge status={order.status} />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <PencilIcon />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Set Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {ORDER_STATUSES.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      disabled={status === order.status}
                      onClick={() => void handleStatusChange(status)}
                    >
                      {STATUS_LABELS[status]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Order #{order.orderNumber} · Payment due {formatDate(order.paymentDate)}
      </p>

      <div className="grid gap-4 md:grid-cols-[1.55fr_1fr]">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-heading text-[15px] font-semibold">Financial Summary</h2>
          <p className="text-[11px] text-dim">For order #{order.orderNumber}</p>
          <div className="mt-2 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            <div className="flex items-baseline justify-between border-b border-dashed py-2.5 text-[12.5px]">
              <span className="text-muted-foreground">Total Capital</span>
              <span className="font-medium tabular-nums">{formatPHP(totalCapital)}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dashed py-2.5 text-[12.5px]">
              <span className="text-muted-foreground">Total Selling</span>
              <span className="font-medium tabular-nums">
                {formatPHP(order.sellingAmount * order.quantity)}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dashed py-2.5 text-[12.5px]">
              <span className="text-muted-foreground">Gross Profit</span>
              <span className="font-medium text-positive tabular-nums">{formatPHP(order.grossProfit)}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dashed py-2.5 text-[12.5px]">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="font-medium tabular-nums">− {formatPHP(order.deliveryFee)}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dashed py-2.5 text-[12.5px]">
              <span className="text-muted-foreground">Agent Commission</span>
              <span className="font-medium tabular-nums">− {formatPHP(order.agentCommission)}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-dashed py-2.5 text-[12.5px]">
              <span className="text-muted-foreground">Middleman Commission</span>
              <span className="font-medium tabular-nums">− {formatPHP(order.middlemanCommission)}</span>
            </div>
          </div>
          <div className="my-2 h-px bg-border" />
          <div className="flex items-baseline justify-between py-2.5">
            <span className="font-medium">Net Profit</span>
            <span className="font-heading text-lg font-semibold">{formatPHP(order.netProfit)}</span>
          </div>
          <div className="my-2 h-px bg-border" />
          <div className="flex items-baseline justify-between py-2.5">
            <span className="font-medium">
              Total Receivable
              <small className="block text-[11px] font-normal text-muted-foreground">
                Net profit plus capital recovered
              </small>
            </span>
            <span className="font-heading text-xl font-semibold text-primary">
              {formatPHP(order.netProfit + totalCapital)}
            </span>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-2.5 font-heading text-[15px] font-semibold">Allocation</h3>
          <div className="flex items-baseline justify-between py-2 text-[12.5px]">
            <span className="text-muted-foreground">Investors</span>
            <span className="font-medium tabular-nums">{investments.length}</span>
          </div>
          <div className="flex items-baseline justify-between py-2 text-[12.5px]">
            <span className="text-muted-foreground">Capital covered</span>
            <span className="font-medium tabular-nums">{formatPHP(totalInvested)}</span>
          </div>
          <div className="flex items-baseline justify-between py-2 text-[12.5px]">
            <span className="text-muted-foreground">Funded</span>
            <span className="font-medium tabular-nums">{formatPercent(fundedRatio)}</span>
          </div>
          <div className="my-3 h-[5px] overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-primary" style={{ width: `${fundedPct}%` }} />
          </div>
          <div className="flex items-baseline justify-between py-2 text-[12.5px]">
            <span className="text-muted-foreground">Est. payouts</span>
            <span className="font-medium tabular-nums">{formatPHP(expectedPayouts)}</span>
          </div>
          <p className="mt-3 border-t border-dashed pt-3 text-[11px] text-dim">
            {fullyCovered
              ? 'Capital fully covered — payouts are auto-computed from each investor\u2019s share on the payment date.'
              : 'Payouts are auto-computed from each investor\u2019s share once the order is fully funded.'}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div>
            <h2 className="font-heading text-[15px] font-semibold">Investor Allocation</h2>
            <p className="mt-0.5 text-[11px] text-dim">
              {investments.length} investors · {formatPercent(fundedRatio)} of capital funded
            </p>
          </div>
          <Button onClick={() => setAssignOpen(true)}>
            <PlusIcon />
            Assign Investor
          </Button>
        </div>
        <InvestorTable order={order} investments={investments} />
      </div>

      <OrderFormModal open={editOpen} onOpenChange={setEditOpen} order={order} />
      <AssignInvestorModal open={assignOpen} onOpenChange={setAssignOpen} order={order} existing={investments} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete order?"
        description={`Delete ${order.itemName} (${order.orderNumber})? This will also remove all investor allocations.`}
        confirmLabel="Delete"
        destructive
        isPending={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
