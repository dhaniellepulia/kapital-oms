import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { AccountUnavailable } from '@/components/shared/AccountUnavailable'
import { PageLoader } from '@/components/shared/PageLoader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { UserRole } from '@/features/users/types'

export function RequireAuth() {
  const { user, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) return <PageLoader />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}

export function RequireRole({ role }: { role: UserRole }) {
  const { user, profile, isInitializing, isProfileLoading } = useAuth()

  if (isInitializing || isProfileLoading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <AccountUnavailable />
  if (profile.role !== role) return <Navigate to="/" replace />
  return <Outlet />
}

export function HomeRedirect() {
  const { user, profile, isInitializing, isProfileLoading } = useAuth()

  if (isInitializing || isProfileLoading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <AccountUnavailable />
  return <Navigate to={profile?.role === 'admin' ? '/admin' : '/my-orders'} replace />
}
