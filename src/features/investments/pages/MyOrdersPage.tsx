import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useInvestorOrders } from '@/features/investments/hooks/useInvestments'
import { formatPHP } from '@/lib/format'
import { InvestorOrderCard } from '../components/InvestorOrderCard'

export function MyOrdersPage() {
  const { user } = useAuth()
  const { data: investorOrders = [], isLoading, isError, error } = useInvestorOrders(user?.uid)

  const totalInvested = investorOrders.reduce(
    (sum, io) => sum + io.investment.investedCapital,
    0,
  )

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl tracking-tight text-foreground">My Orders</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {investorOrders.length} active allocations · {formatPHP(totalInvested)} invested
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-[210px] rounded-[15px] border bg-card shadow-sm" />
          ))}
        </div>
      ) : isError ? (
        <ErrorBanner
          message={error instanceof Error ? error.message : 'Failed to load your orders'}
        />
      ) : investorOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
          <p className="font-heading text-base font-medium">No orders yet</p>
          <p className="mt-1 text-xs text-muted-foreground">You have no active allocations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {investorOrders.map((io) => (
            <InvestorOrderCard key={io.order.id} investment={io.investment} order={io.order} />
          ))}
        </div>
      )}
    </div>
  )
}
