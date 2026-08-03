import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { MobileSidebar } from './MobileSidebar'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import type { NavItem } from './types'

interface AppLayoutProps {
  sectionLabel: string
  items: NavItem[]
  tagline: string
  roleLabel: string
}

export function AppLayout({
  sectionLabel,
  items,
  tagline,
  roleLabel,
}: AppLayoutProps) {
  const { profile, signOut } = useAuth()
  const { pathname } = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const sidebarProps = {
    sectionLabel,
    items,
    tagline,
    profile,
    roleLabel,
    onSignOut: () => void signOut(),
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar {...sidebarProps} />
      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar userName={profile?.name ?? ''} onMenuClick={() => setIsMenuOpen(true)} />
        <div className="flex min-w-0 flex-1 flex-col gap-5 p-7 max-[720px]:px-4">
          <Outlet />
        </div>
      </main>
      <MobileSidebar open={isMenuOpen} onOpenChange={setIsMenuOpen} {...sidebarProps} />
    </div>
  )
}
