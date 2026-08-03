import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CheckIcon, PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import {
  agentCommission as calcAgentCommission,
  middlemanCommission as calcMiddlemanCommission,
  netProfit,
} from '@/lib/calculations'
import { formatPercent, formatPHP } from '@/lib/format'
import { useCreateOrder, useUpdateOrder } from '@/features/orders/hooks/useOrders'
import { useSettings } from '@/features/settings/hooks/useSettings'
import { orderSchema, type OrderFormValues } from '../schemas/orderSchema'
import type { Order, OrderInput } from '../types'

interface OrderFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order?: Order | null
}

const labelClass = 'text-xs font-medium text-muted-foreground'

export function OrderFormModal({ open, onOpenChange, order }: OrderFormModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const createMutation = useCreateOrder()
  const updateMutation = useUpdateOrder()
  const settings = useSettings()
  const isPending = createMutation.isPending || updateMutation.isPending

  const defaultValues = useMemo<OrderFormValues>(
    () => ({
      itemName: order?.itemName ?? '',
      quantity: order?.quantity ?? 1,
      capital: order?.capital ?? 0,
      sellingAmount: order?.sellingAmount ?? 0,
      deliveryFee: order?.deliveryFee ?? 0,
      paymentDate: order ? format(order.paymentDate, 'yyyy-MM-dd') : '',
      notes: order?.notes ?? '',
    }),
    [order],
  )

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema) as unknown as Resolver<OrderFormValues>,
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      reset(defaultValues)
      setSubmitError(null)
    }
  }, [open, reset, defaultValues])

  const watched = useWatch({ control })
  const quantity = Number(watched.quantity) || 1
  const capital = Number(watched.capital) || 0
  const sellingAmount = Number(watched.sellingAmount) || 0
  const deliveryFee = Number(watched.deliveryFee) || 0
  const agentRate = settings.data?.agentCommissionRate ?? 0.1
  const middlemanRate = settings.data?.middlemanCommissionRate ?? 0.1
  const grossProfit = (sellingAmount - capital) * quantity
  const agentFee = calcAgentCommission(grossProfit, agentRate)
  const middlemanFee = calcMiddlemanCommission(grossProfit, middlemanRate)
  const net = netProfit(grossProfit, deliveryFee, { agent: agentRate, middleman: middlemanRate })
  const totalCapital = capital * quantity
  const totalSelling = sellingAmount * quantity
  const totalReceivable = net + totalCapital

  const submit = handleSubmit(async (values) => {
    setSubmitError(null)
    const gross = (values.sellingAmount - values.capital) * values.quantity
    const input: OrderInput = {
      itemName: values.itemName,
      quantity: values.quantity,
      capital: values.capital,
      sellingAmount: values.sellingAmount,
      grossProfit: gross,
      deliveryFee: values.deliveryFee,
      paymentDate: new Date(`${values.paymentDate}T12:00:00`),
      notes: values.notes ?? '',
    }
    try {
      if (order) {
        await updateMutation.mutateAsync({ id: order.id, patch: input })
      } else {
        await createMutation.mutateAsync(input)
      }
      onOpenChange(false)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save order')
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[720px] overflow-y-auto sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{order ? 'Edit Order' : 'New Order'}</DialogTitle>
          <DialogDescription>
            {order
              ? 'Update order details. Profit is recomputed automatically.'
              : 'Add an order to track capital and investor allocation.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate>
          <div className="grid gap-6 sm:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="itemName" className={labelClass}>
                  Item Name *
                </Label>
                <Input
                  id="itemName"
                  placeholder="387 Monobloc"
                  {...register('itemName')}
                />
                {errors.itemName && (
                  <p className="text-xs text-destructive">{errors.itemName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="quantity" className={labelClass}>
                    Quantity *
                  </Label>
                  <Controller
                    control={control}
                    name="quantity"
                    render={({ field }) => (
                      <Input id="quantity" type="number" min={1} step="1" {...field} />
                    )}
                  />
                  {errors.quantity && (
                    <p className="text-xs text-destructive">{errors.quantity.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="capital" className={labelClass}>
                    Capital (₱ per item)
                  </Label>
                  <Controller
                    control={control}
                    name="capital"
                    render={({ field }) => (
                      <Input id="capital" type="number" min={0} step="0.01" {...field} />
                    )}
                  />
                  {errors.capital && (
                    <p className="text-xs text-destructive">{errors.capital.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sellingAmount" className={labelClass}>
                    Selling Amount (₱ per item)
                  </Label>
                  <Controller
                    control={control}
                    name="sellingAmount"
                    render={({ field }) => (
                      <Input id="sellingAmount" type="number" min={0} step="0.01" {...field} />
                    )}
                  />
                  {errors.sellingAmount && (
                    <p className="text-xs text-destructive">{errors.sellingAmount.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deliveryFee" className={labelClass}>
                    Delivery Fee (₱)
                  </Label>
                  <Controller
                    control={control}
                    name="deliveryFee"
                    render={({ field }) => (
                      <Input id="deliveryFee" type="number" min={0} step="0.01" {...field} />
                    )}
                  />
                  {errors.deliveryFee && (
                    <p className="text-xs text-destructive">{errors.deliveryFee.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentDate" className={labelClass}>
                  Payment Date *
                </Label>
                <Controller
                  control={control}
                  name="paymentDate"
                  render={({ field }) => (
                    <Input id="paymentDate" type="date" {...field} />
                  )}
                />
                {errors.paymentDate && (
                  <p className="text-xs text-destructive">{errors.paymentDate.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className={labelClass}>
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Optional notes…"
                  {...register('notes')}
                />
              </div>
            </div>

            <aside className="rounded-xl border bg-popover p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-heading text-sm font-semibold">Financial Summary</p>
                <span className="rounded-full border bg-background px-2.5 py-0.5 text-[9px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                  Auto-computed
                </span>
              </div>
              <dl className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-muted-foreground">Total Capital</dt>
                  <dd className="font-medium tabular-nums">{formatPHP(totalCapital)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-muted-foreground">Total Selling</dt>
                  <dd className="font-medium tabular-nums">{formatPHP(totalSelling)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-muted-foreground">Gross Profit</dt>
                  <dd className="font-medium text-positive tabular-nums">{formatPHP(grossProfit)}</dd>
                </div>
              </dl>
              <div className="my-1 h-px bg-border" />
              <p className="text-[10px] font-medium tracking-[0.08em] text-dim uppercase">
                Deductions
              </p>
              <dl className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-muted-foreground">Delivery Fee</dt>
                  <dd className="font-medium tabular-nums">− {formatPHP(deliveryFee)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-muted-foreground">Agent Commission</dt>
                  <dd className="font-medium tabular-nums">− {formatPHP(agentFee)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-muted-foreground">Middleman Commission</dt>
                  <dd className="font-medium tabular-nums">− {formatPHP(middlemanFee)}</dd>
                </div>
              </dl>
              <div className="my-1 h-px bg-border" />
              <dl className="space-y-2">
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-muted-foreground">Estimated Net Profit</dt>
                  <dd className="font-heading text-lg font-semibold text-primary tabular-nums">
                    {formatPHP(net)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-muted-foreground">Total Receivable</dt>
                  <dd className="font-heading text-lg font-semibold tabular-nums">
                    {formatPHP(totalReceivable)}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-[11px] text-dim">
                Agent {formatPercent(agentRate)} · Middleman {formatPercent(middlemanRate)} of
                gross, plus delivery fee — auto-deducted from gross profit.
              </p>
            </aside>
          </div>

          {submitError && (
            <div className="mt-4">
              <ErrorBanner message={submitError} />
            </div>
          )}

          <DialogFooter className="mt-6">
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isPending}>
              {order ? (
                <>
                  <CheckIcon />
                  Save Changes
                </>
              ) : (
                <>
                  <PlusIcon />
                  Create Order
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
