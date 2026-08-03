import type { UserRole } from '../types'
import { cn } from '@/lib/utils'

const LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  user: 'User',
}

const CLASSES: Record<UserRole, string> = {
  admin: 'bg-brand-soft text-[#2446b5]',
  user: 'bg-secondary text-[#52525c] border border-border',
}

const DOTS: Record<UserRole, string> = {
  admin: 'bg-primary',
  user: 'bg-[#a2a2ad]',
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
