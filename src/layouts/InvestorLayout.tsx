import { useMemo } from 'react'
import { LayoutGrid, User, Wallet } from 'lucide-react'

import { AppLayout } from '@/components/layout/AppLayout'
import type { NavItem } from '@/components/layout/types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useInvestorOrders } from '@/features/investments/hooks/useInvestments'

const investorNav: Omit<NavItem, 'count'>[] = [
  { label: 'My Orders', to: '/my-orders', icon: LayoutGrid },
  { label: 'Payouts', to: '/my-orders/payouts', icon: Wallet },
  { label: 'Profile', to: '/my-orders/profile', icon: User },
]

export function InvestorLayout() {
  const { user } = useAuth()
  const { data: investorOrders } = useInvestorOrders(user?.uid)

  const items: NavItem[] = useMemo(
    () =>
      investorNav.map((item) =>
        item.to === '/my-orders' ? { ...item, count: investorOrders?.length } : item,
      ),
    [investorOrders],
  )

  return (
    <AppLayout
      sectionLabel="Portfolio"
      items={items}
      tagline="Investor"
      roleLabel="Investor"
    />
  )
}
