import { useEffect, useMemo, useState } from 'react'

import { ErrorBanner } from '@/components/shared/ErrorBanner'
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
import { useAssignGuestInvestor, useAssignInvestor } from '@/features/investments/hooks/useInvestments'
import type { Investment } from '@/features/investments/types'
import type { Order } from '@/features/orders/types'
import { useUsers } from '@/features/users/hooks/useUsers'
import { formatPHP } from '@/lib/format'

interface AssignInvestorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  existing: Investment[]
}

const OTHER_VALUE = '__other__'

export function AssignInvestorModal({
  open,
  onOpenChange,
  order,
  existing,
}: AssignInvestorModalProps) {
  const { data: users = [], isLoading: usersLoading } = useUsers()
  const assignInvestor = useAssignInvestor()
  const assignGuestInvestor = useAssignGuestInvestor()

  const [selectedUserId, setSelectedUserId] = useState('')
  const [guestName, setGuestName] = useState('')
  const [amount, setAmount] = useState('')
  const [validationError, setValidationError] = useState('')
  const [submitError, setSubmitError] = useState('')

  const assigned = existing.reduce((sum, inv) => sum + inv.investedCapital, 0)
  const remaining = order.capital * order.quantity - assigned
  const fullyCovered = remaining <= 0
  const isGuest = selectedUserId === OTHER_VALUE

  const eligibleUsers = useMemo(
    () => users.filter((u) => u.role === 'user' && !existing.some((e) => e.userId === u.uid)),
    [users, existing],
  )

  useEffect(() => {
    if (!open) return
    setAmount('')
    setValidationError('')
    setSubmitError('')
    setGuestName('')
    setSelectedUserId(eligibleUsers[0]?.uid ?? OTHER_VALUE)
  }, [open, eligibleUsers])

  async function handleSubmit() {
    const value = Number(amount)
    if (!amount || Number.isNaN(value) || value <= 0) {
      setValidationError('Enter an amount greater than 0.')
      return
    }
    if (value > remaining) {
      setValidationError(`Amount exceeds the remaining capital of ${formatPHP(remaining)}.`)
      return
    }
    const name = guestName.trim()
    if (isGuest && !name) {
      setValidationError('Enter the investor name.')
      return
    }
    setValidationError('')
    try {
      if (isGuest) {
        await assignGuestInvestor.mutateAsync({
          orderId: order.id,
          investorName: name,
          investedCapital: value,
        })
      } else {
        await assignInvestor.mutateAsync({
          orderId: order.id,
          userId: selectedUserId,
          investedCapital: value,
        })
      }
      onOpenChange(false)
    } catch {
      setSubmitError('Failed to assign investor. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Assign Investor</DialogTitle>
          <DialogDescription>Allocate a share of this order's capital to an investor.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="rounded-lg bg-popover px-3 py-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Remaining capital</span>
              <span className="font-medium tabular-nums">{formatPHP(remaining)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-dim">
              <span>Capital already assigned</span>
              <span className="tabular-nums">{formatPHP(assigned)}</span>
            </div>
          </div>

          {fullyCovered ? (
            <p className="text-xs text-muted-foreground">This order's capital is fully covered.</p>
          ) : (
            <>
              <div className="grid gap-1.5">
                <Label>Investor</Label>
                <select
                  className="h-8 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  {usersLoading ? (
                    <option value="" disabled>
                      Loading investors…
                    </option>
                  ) : (
                    eligibleUsers.map((user) => (
                      <option key={user.uid} value={user.uid}>
                        {user.name}
                      </option>
                    ))
                  )}
                  <option value={OTHER_VALUE}>Other (no account)</option>
                </select>
              </div>

              {isGuest && (
                <div className="grid gap-1.5">
                  <Label>Investor Name *</Label>
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                  />
                </div>
              )}

              <div className="grid gap-1.5">
                <Label>Invested Capital (₱)</Label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {validationError && <p className="text-xs text-destructive">{validationError}</p>}
              {submitError && <ErrorBanner message={submitError} />}
            </>
          )}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            disabled={
              (isGuest ? !guestName.trim() : !selectedUserId) ||
              !amount ||
              assignInvestor.isPending ||
              assignGuestInvestor.isPending ||
              remaining <= 0
            }
            onClick={() => void handleSubmit()}
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
