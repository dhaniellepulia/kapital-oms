import { useMemo } from 'react'
import { LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { Logo } from '@/components/brand/Logo'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import type { UserProfile } from '@/features/users/types'
import { cn } from '@/lib/utils'
import type { NavItem } from './types'

export interface SidebarContentProps {
  sectionLabel: string
  items: NavItem[]
  tagline: string
  profile: UserProfile | null
  roleLabel: string
  onSignOut: () => void
}

export function SidebarContent({
  sectionLabel,
  items,
  tagline,
  profile,
  roleLabel,
  onSignOut,
}: SidebarContentProps) {
  const { pathname } = useLocation()

  const itemPaths = useMemo(() => new Set(items.map((item) => item.to)), [items])

  const isItemActive = (to: string) => {
    if (pathname === to) return true
    if (!pathname.startsWith(`${to}/`)) return false
    return ![...itemPaths].some(
      (other) => other !== to && (pathname === other || pathname.startsWith(`${other}/`)),
    )
  }

  return (
    <div className="flex h-full w-full flex-col p-[18px_14px]">
      <div className="px-2.5 pb-5 pt-1.5">
        <Logo tagline={tagline} />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        <div className="px-3 pb-2.5 pt-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-dim">
          {sectionLabel}
        </div>
        {items.map((item) => {
          const isActive = isItemActive(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive ? 'page' : undefined}
              className="flex"
            >
              <span
                className={cn(
                  'flex w-full items-center gap-[11px] rounded-[10px] px-3 py-2 text-[13px] font-medium',
                  isActive
                    ? 'border border-border bg-background text-foreground shadow-sm'
                    : 'border border-transparent text-muted-foreground hover:bg-background hover:text-foreground',
                )}
              >
                <item.icon
                  className={cn('size-[17px] shrink-0', isActive ? 'text-primary' : '')}
                />
                <span>{item.label}</span>
                {item.count != null && (
                  <span className="ml-auto text-[10.5px] font-medium text-dim">{item.count}</span>
                )}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-2 border-t border-border pt-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <UserAvatar name={profile?.name ?? '?'} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-medium text-foreground">
              {profile?.name ?? '—'}
            </p>
            <p className="text-[10.5px] text-dim">{roleLabel}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-[10px] border border-border"
          aria-label="Sign out"
          onClick={onSignOut}
        >
          <LogOut className="size-[17px]" />
        </Button>
      </div>
    </div>
  )
}

interface SidebarProps extends SidebarContentProps {}

export function Sidebar(props: SidebarProps) {
  return (
    <aside className="w-[238px] shrink-0 border-r border-border bg-sidebar max-[900px]:hidden">
      <SidebarContent {...props} />
    </aside>
  )
}
