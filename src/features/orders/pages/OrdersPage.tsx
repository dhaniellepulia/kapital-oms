import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckIcon,
  DownloadIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useAllInvestments } from '@/features/investments/hooks/useInvestments'
import { InvestorStack } from '@/features/orders/components/InvestorStack'
import { OrderFormModal } from '@/features/orders/components/OrderFormModal'
import { StatusFilter } from '@/features/orders/components/StatusFilter'
import { ORDER_STATUS_LABELS } from '@/features/orders/components/status'
import { useDeleteOrder, useOrders, useUpdateOrderStatus } from '@/features/orders/hooks/useOrders'
import { ORDER_STATUSES, type Order, type OrderStatus } from '@/features/orders/types'
import { downloadCsv } from '@/lib/csv'
import { formatDate, formatPHP } from '@/lib/format'
import { cn } from '@/lib/utils'

const headerCellClass = 'text-[10.5px] font-medium tracking-[0.08em] text-dim uppercase'

const headerCells: { label: string; className?: string }[] = [
  { label: 'Item' },
  { label: 'Quantity', className: 'text-center' },
  { label: 'Total Capital', className: 'text-right' },
  { label: 'Selling Price', className: 'text-right' },
  { label: 'Gross Profit', className: 'text-right' },
  { label: 'Net Profit', className: 'text-right' },
  { label: 'Payment Date' },
  { label: 'Status' },
  { label: 'Investors' },
  { label: 'Actions', className: 'text-center' },
]

function OrdersTableHeader() {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        {headerCells.map(({ label, className }) => (
          <TableHead key={label} className={cn(headerCellClass, className)}>
            {label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  )
}

function OrdersTableSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table className="min-w-[960px]">
        <OrdersTableHeader />
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-3.5 w-8" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-3.5 w-20" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-3.5 w-20" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-3.5 w-20" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-3.5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3.5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto size-6 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function OrdersPage() {
  const navigate = useNavigate()
  const { data: orders, isLoading, isError, error } = useOrders()
  const { byOrderId } = useAllInvestments()
  const updateStatusMutation = useUpdateOrderStatus()
  const deleteMutation = useDeleteOrder()

  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)

  const total = orders?.length ?? 0

  const totalCapital = useMemo(
    () => (orders ?? []).reduce((sum, order) => sum + order.capital * order.quantity, 0),
    [orders],
  )

  const statusCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = { open: 0, allocated: 0, paid: 0, completed: 0 }
    for (const order of orders ?? []) counts[order.status] += 1
    return counts
  }, [orders])

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (orders ?? []).filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false
      if (q && !order.itemName.toLowerCase().includes(q) && !order.orderNumber.toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  }, [orders, query, statusFilter])

  const investmentsFor = (order: Order) => byOrderId[order.id] ?? []

  const handleStatusChange = (order: Order, status: OrderStatus) => {
    if (order.status === status) return
    void updateStatusMutation.mutateAsync({ id: order.id, status })
  }

  const handleExport = () => {
    const header = [
      'Order #',
      'Item',
      'Quantity',
      'Capital (per item)',
      'Selling Amount (per item)',
      'Gross Profit',
      'Delivery Fee',
      'Net Profit',
      'Payment Date',
      'Status',
    ]
    const rows = filteredOrders.map((order) => [
      order.orderNumber,
      order.itemName,
      String(order.quantity),
      order.capital.toFixed(2),
      order.sellingAmount.toFixed(2),
      order.grossProfit.toFixed(2),
      order.deliveryFee.toFixed(2),
      order.netProfit.toFixed(2),
      formatDate(order.paymentDate),
      ORDER_STATUS_LABELS[order.status],
    ])
    downloadCsv('orders.csv', header, rows)
  }

  const openCreate = () => {
    setEditingOrder(null)
    setModalOpen(true)
  }

  const openEdit = (order: Order) => {
    setEditingOrder(order)
    setModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!orderToDelete) return
    await deleteMutation.mutateAsync(orderToDelete.id)
    setOrderToDelete(null)
  }

  const statusMenu = (order: Order) => (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Set Status</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {ORDER_STATUSES.map((status) => {
          const current = order.status === status
          return (
            <DropdownMenuItem
              key={status}
              disabled={current}
              onClick={() => handleStatusChange(order, status)}
            >
              {current ? (
                <CheckIcon className="size-3.5" />
              ) : (
                <span className="size-3.5" />
              )}
              {ORDER_STATUS_LABELS[status]}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )

  const actionsMenu = (order: Order, align: 'start' | 'end') => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuItem onClick={() => navigate(`/admin/orders/${order.id}`)}>
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openEdit(order)}>Edit</DropdownMenuItem>
        {statusMenu(order)}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => setOrderToDelete(order)}>
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl tracking-tight text-foreground">Orders</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {total} orders · {formatPHP(totalCapital)} total capital
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon />
          New Order
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <StatusFilter
          value={statusFilter}
          counts={statusCounts}
          total={total}
          onChange={setStatusFilter}
        />
        <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredOrders.length === 0}>
          <DownloadIcon />
          Export CSV
        </Button>
      </div>

      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-dim" />
        <Input
          className="h-9 pl-9"
          placeholder="Search by item or order #"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <OrdersTableSkeleton />
      ) : isError ? (
        <ErrorBanner message={error instanceof Error ? error.message : 'Failed to load orders'} />
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
          <p className="font-heading text-base font-medium">No orders yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create your first order to start tracking capital and investor allocation.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground shadow-sm">
          No orders match your search.
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <div className="rounded-xl border bg-card shadow-sm">
              <Table className="min-w-[960px]">
                <OrdersTableHeader />
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                    >
                      <TableCell>
                        <div>
                          <p className="text-[13px] font-medium text-foreground">{order.itemName}</p>
                          <p className="text-[11px] text-dim">{order.orderNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{order.quantity}</TableCell>
                      <TableCell className="text-right whitespace-nowrap [font-variant-numeric:tabular-nums]">
                        {formatPHP(order.capital * order.quantity)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap [font-variant-numeric:tabular-nums]">
                        {formatPHP(order.sellingAmount)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-positive whitespace-nowrap [font-variant-numeric:tabular-nums]">
                        {formatPHP(order.grossProfit)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-positive whitespace-nowrap [font-variant-numeric:tabular-nums]">
                        {formatPHP(order.netProfit)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(order.paymentDate)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        <InvestorStack names={investmentsFor(order).map((i) => i.investorName)} />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                          {actionsMenu(order, 'end')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {filteredOrders.map((order) => {
              const investorNames = investmentsFor(order).map((i) => i.investorName)
              return (
                <Card key={order.id} className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate font-medium">{order.itemName}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-0.5 text-[11px] text-dim">
                    {order.orderNumber} · due {formatDate(order.paymentDate)}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-dim">Total Capital</p>
                      <p className="text-[13px] font-medium">
                        {formatPHP(order.capital * order.quantity)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-dim">Gross Profit</p>
                      <p className="text-[13px] font-medium text-positive">
                        {formatPHP(order.grossProfit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-dim">Net Profit</p>
                      <p className="text-[13px] font-medium text-positive">
                        {formatPHP(order.netProfit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-dim">Selling Price</p>
                      <p className="text-[13px] font-medium">{formatPHP(order.sellingAmount)}</p>
                    </div>
                  </div>
                  {investorNames.length > 0 && (
                    <div className="mt-3">
                      <InvestorStack names={investorNames} />
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                    >
                      View
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(order)}>
                      <PencilIcon />
                    </Button>
                    <div className="ml-auto">{actionsMenu(order, 'end')}</div>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      <OrderFormModal open={modalOpen} onOpenChange={setModalOpen} order={editingOrder} />

      <ConfirmDialog
        open={Boolean(orderToDelete)}
        onOpenChange={(open) => {
          if (!open) setOrderToDelete(null)
        }}
        title="Delete order?"
        description="This permanently deletes the order and removes all investor allocations."
        confirmLabel="Delete"
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
