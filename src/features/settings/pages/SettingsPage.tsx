import { useEffect, useRef, useState } from 'react'
import { CheckIcon } from 'lucide-react'

import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPercent } from '@/lib/format'
import { useSettings, useUpdateSettings } from '../hooks/useSettings'

const labelClass = 'text-xs font-medium text-muted-foreground'

function rateToPercent(rate: number): number {
  return Math.round(rate * 1000) / 10
}

function parsePercent(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return null
  return parsed
}

export function SettingsPage() {
  const { data: settings, isLoading, isError, error } = useSettings()
  const updateMutation = useUpdateSettings()

  const seededRef = useRef(false)
  const [agentPercent, setAgentPercent] = useState('')
  const [middlemanPercent, setMiddlemanPercent] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings && !seededRef.current) {
      seededRef.current = true
      setAgentPercent(String(rateToPercent(settings.agentCommissionRate)))
      setMiddlemanPercent(String(rateToPercent(settings.middlemanCommissionRate)))
    }
  }, [settings])

  const agent = parsePercent(agentPercent)
  const middleman = parsePercent(middlemanPercent)
  const currentAgent = settings ? rateToPercent(settings.agentCommissionRate) : null
  const currentMiddleman = settings ? rateToPercent(settings.middlemanCommissionRate) : null

  const valid = agent !== null && middleman !== null
  const dirty =
    currentAgent !== null &&
    currentMiddleman !== null &&
    (agent !== currentAgent || middleman !== currentMiddleman)
  const pending = updateMutation.isPending

  const handleChange = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setSaved(false)
    setSaveError(null)
  }

  const handleSave = async () => {
    if (agent === null || middleman === null) return
    setSaveError(null)
    try {
      await updateMutation.mutateAsync({
        agentCommissionRate: agent / 100,
        middlemanCommissionRate: middleman / 100,
      })
      setSaved(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Configure the commission rates applied to new orders.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      ) : isError ? (
        <ErrorBanner message={error instanceof Error ? error.message : 'Failed to load settings'} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="rounded-xl border border-border shadow-sm [--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardTitle>Commission rates</CardTitle>
              <CardDescription>Applied to new and edited orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="agentRate" className={labelClass}>
                    Agent commission
                  </Label>
                  <div className="relative">
                    <Input
                      id="agentRate"
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      className="pr-8"
                      value={agentPercent}
                      onChange={(e) => handleChange(setAgentPercent)(e.target.value)}
                      aria-invalid={agent === null && agentPercent !== ''}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                      %
                    </span>
                  </div>
                  {agent === null && agentPercent !== '' && (
                    <p className="text-xs text-destructive">Enter a value between 0 and 100.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="middlemanRate" className={labelClass}>
                    Middleman commission
                  </Label>
                  <div className="relative">
                    <Input
                      id="middlemanRate"
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      className="pr-8"
                      value={middlemanPercent}
                      onChange={(e) => handleChange(setMiddlemanPercent)(e.target.value)}
                      aria-invalid={middleman === null && middlemanPercent !== ''}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                      %
                    </span>
                  </div>
                  {middleman === null && middlemanPercent !== '' && (
                    <p className="text-xs text-destructive">Enter a value between 0 and 100.</p>
                  )}
                </div>
              </div>

              <p className="mt-4 text-[11px] text-dim">
                Preview: agent {agent !== null ? formatPercent(agent / 100) : '—'} · middleman{' '}
                {middleman !== null ? formatPercent(middleman / 100) : '—'} of gross profit
              </p>

              {saveError && (
                <div className="mt-4">
                  <ErrorBanner message={saveError} />
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                {saved ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-positive">
                    <CheckIcon className="size-3.5" />
                    Settings saved
                  </span>
                ) : (
                  <span />
                )}
                <Button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={pending || !valid || !dirty}
                >
                  <CheckIcon />
                  {pending ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border shadow-sm [--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>How commission rates are used</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-dim">
                Agent and middleman commissions are deducted from each order's gross profit. The
                rates you set here apply to new and edited orders; the remaining net profit is
                shared with investors.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
