import { useEffect, useState, type FormEvent } from 'react'

import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { UserAvatar } from '@/components/shared/UserAvatar'
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
import { useAuth } from '@/features/auth/hooks/useAuth'
import { updateUserProfile } from '@/features/users/api/usersService'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const ROLE_BADGE_CLASSES = {
  admin: 'bg-brand-soft text-accent-foreground',
  user: 'bg-secondary text-muted-foreground border border-border',
} as const

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) setName(profile.name)
  }, [profile])

  useEffect(() => {
    if (!saved) return
    const timeoutId = window.setTimeout(() => setSaved(false), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [saved])

  if (!profile) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="font-heading text-2xl tracking-tight text-foreground">Profile</h1>
          <p className="mt-1 text-xs text-muted-foreground">Manage your account information.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="h-[180px] rounded-xl border bg-card shadow-sm" />
          ))}
        </div>
      </div>
    )
  }

  const trimmedName = name.trim()
  const isUnchanged = trimmedName === profile.name

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user || trimmedName === '') return
    setIsSaving(true)
    setError(null)
    setSaved(false)
    try {
      await updateUserProfile(user.uid, { name: trimmedName })
      await refreshProfile()
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl tracking-tight text-foreground">Profile</h1>
        <p className="mt-1 text-xs text-muted-foreground">Manage your account information.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your sign-in details.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <UserAvatar name={profile.name} size="lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-[15px] font-medium text-foreground">{profile.name}</p>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[11.5px] font-medium whitespace-nowrap',
                    ROLE_BADGE_CLASSES[profile.role],
                  )}
                >
                  {profile.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
              <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-dim">Member since {formatDate(profile.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>Update the name shown across the app.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="display-name">Display name</Label>
                <Input
                  id="display-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (saved) setSaved(false)
                  }}
                  placeholder="Your name"
                  disabled={isSaving}
                  aria-invalid={error != null}
                />
                {error && <ErrorBanner message={error} />}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={isSaving || trimmedName === '' || isUnchanged}
                >
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </Button>
                {saved && <p className="text-sm text-muted-foreground">Saved</p>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
