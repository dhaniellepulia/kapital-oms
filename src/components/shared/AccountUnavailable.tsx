import { useState } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function AccountUnavailable() {
  const { refreshProfile, signOut } = useAuth()
  const [retrying, setRetrying] = useState(false)
  const [failed, setFailed] = useState(false)

  async function handleRetry() {
    setRetrying(true)
    setFailed(false)
    try {
      await refreshProfile()
    } catch {
      setFailed(true)
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <p className="font-heading text-lg font-semibold text-foreground">Couldn&apos;t load your account</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        We couldn&apos;t verify your account details. Check your connection and try again.
      </p>
      {failed && <p className="text-xs text-destructive">Still can&apos;t reach the server. Try again in a moment.</p>}
      <div className="mt-1 flex items-center gap-2">
        <Button size="sm" onClick={() => void handleRetry()} disabled={retrying}>
          {retrying ? 'Retrying…' : 'Try again'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
