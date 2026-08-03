import { UserAvatar } from '@/components/shared/UserAvatar'
import { cn } from '@/lib/utils'

interface InvestorStackProps {
  names: string[]
  max?: number
}

export function InvestorStack({ names, max = 3 }: InvestorStackProps) {
  if (names.length === 0) {
    return <span className="text-[11px] text-dim">—</span>
  }

  const shown = names.slice(0, max)
  const extra = names.length - max

  return (
    <span className="inline-flex items-center">
      {shown.map((name, index) => (
        <UserAvatar
          key={name}
          name={name}
          size="sm"
          className={cn('-ml-1.5 first:ml-0', index > 0 && 'ring-2 ring-background')}
        />
      ))}
      {extra > 0 && (
        <span className="grid size-6 -ml-1.5 place-items-center rounded-full border border-border bg-secondary text-[9px] font-semibold text-muted-foreground ring-2 ring-background">
          +{extra}
        </span>
      )}
    </span>
  )
}
