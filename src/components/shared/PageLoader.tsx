import { Skeleton } from '@/components/ui/skeleton'

export function PageLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Skeleton className="size-8 rounded-full" />
    </main>
  )
}
