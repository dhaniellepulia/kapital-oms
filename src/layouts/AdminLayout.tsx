import { Package, SlidersHorizontal, Users } from 'lucide-react'

import { AppLayout } from '@/components/layout/AppLayout'
import type { NavItem } from '@/components/layout/types'

const adminNav: NavItem[] = [
  { label: 'Orders', to: '/admin/orders', icon: Package },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Settings', to: '/admin/settings', icon: SlidersHorizontal },
]

export function AdminLayout() {
  return (
    <AppLayout
      sectionLabel="Main"
      items={adminNav}
      tagline="Order Management"
      roleLabel="Administrator"
    />
  )
}
