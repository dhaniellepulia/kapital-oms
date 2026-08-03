import type { UserRole } from '../types'
import { cn } from '@/lib/utils'

const LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  user: 'User',
}

const CLASSES: Record<UserRole, string> = {
  admin: 'bg-brand-soft text-accent-foreground',
  user: 'bg-secondary text-muted-foreground border border-border',
}

const DOTS: Record<UserRole, string> = {
  admin: 'bg-primary',
  user: 'bg-muted-foreground/60',
}

interface RoleBadgeProps {
  role: UserRole
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-medium whitespace-nowrap',
        CLASSES[role],
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', DOTS[role])} />
      {LABELS[role]}
    </span>
  )
}
