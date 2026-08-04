import type { SortKey } from '@/features/investments/lib/sort'
import { cn } from '@/lib/utils'

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date', label: 'Newest' },
  { value: 'amount', label: 'Amount' },
]

interface SortControlProps {
  value: SortKey
  onChange: (value: SortKey) => void
}

export function SortControl({ value, onChange }: SortControlProps) {
  return (
    <div className="inline-flex gap-0.5 rounded-xl border border-border bg-secondary p-0.5">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'h-[30px] rounded-lg px-3 text-xs font-medium whitespace-nowrap transition-colors',
            value === option.value
              ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
