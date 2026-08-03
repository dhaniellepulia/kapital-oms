import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface FeaturePlaceholderProps {
  title: string
  note: string
}

export function FeaturePlaceholder({ title, note }: FeaturePlaceholderProps) {
  const { profile, user, signOut } = useAuth()

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 py-14 text-center">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{note}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 text-left text-sm shadow-sm">
        <p className="text-xs text-dim">Signed in as</p>
        <p className="mt-0.5 font-medium">{profile?.name ?? user?.email}</p>
        <p className="text-xs text-dim">Role: {profile?.role ?? 'unknown'}</p>
      </div>
      <Button variant="outline" onClick={() => void signOut()}>
        Sign out
      </Button>
    </main>
  )
}
