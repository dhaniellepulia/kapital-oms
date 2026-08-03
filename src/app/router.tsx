import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import { PageLoader } from '@/components/shared/PageLoader'
import { AdminLayout } from '@/layouts/AdminLayout'
import { InvestorLayout } from '@/layouts/InvestorLayout'
import { HomeRedirect, RequireAuth, RequireRole } from './guards'

const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const SignupPage = lazy(() =>
  import('@/features/auth/pages/SignupPage').then((m) => ({ default: m.SignupPage })),
)
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const OrdersPage = lazy(() =>
  import('@/features/orders/pages/OrdersPage').then((m) => ({ default: m.OrdersPage })),
)
const OrderDetailsPage = lazy(() =>
  import('@/features/orders/pages/OrderDetailsPage').then((m) => ({
    default: m.OrderDetailsPage,
  })),
)
const UsersPage = lazy(() =>
  import('@/features/users/pages/UsersPage').then((m) => ({ default: m.UsersPage })),
)
const SettingsPage = lazy(() =>
  import('@/features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const MyOrdersPage = lazy(() =>
  import('@/features/investments/pages/MyOrdersPage').then((m) => ({ default: m.MyOrdersPage })),
)
const UserOrderDetailsPage = lazy(() =>
  import('@/features/investments/pages/UserOrderDetailsPage').then((m) => ({
    default: m.UserOrderDetailsPage,
  })),
)
const PayoutsPage = lazy(() =>
  import('@/features/investments/pages/PayoutsPage').then((m) => ({ default: m.PayoutsPage })),
)
const ProfilePage = lazy(() =>
  import('@/features/users/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  {
    element: <RequireAuth />,
    children: [
      { index: true, element: <HomeRedirect /> },
      {
        path: 'admin',
        element: <RequireRole role="admin" />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              {
                path: 'orders',
                children: [
                  { index: true, element: <OrdersPage /> },
                  { path: ':id', element: <OrderDetailsPage /> },
                ],
              },
              { path: 'users', element: <UsersPage /> },
              { path: 'settings', element: <SettingsPage /> },
            ],
          },
        ],
      },
      {
        path: 'my-orders',
        element: <RequireRole role="user" />,
        children: [
          {
            element: <InvestorLayout />,
            children: [
              { index: true, element: <MyOrdersPage /> },
              { path: ':id', element: <UserOrderDetailsPage /> },
              { path: 'payouts', element: <PayoutsPage /> },
              { path: 'profile', element: <ProfilePage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
