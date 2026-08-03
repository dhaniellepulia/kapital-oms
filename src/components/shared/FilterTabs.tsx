import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface FilterTabOption<T extends string> {
  value: T
  label: string
  count?: number
}

interface FilterTabsProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: FilterTabOption<T>[]
  placeholder: string
}

export function FilterTabs<T extends string>({
  value,
  onChange,
  options,
  placeholder,
}: FilterTabsProps<T>) {
  return (
    <>
      <div className="hidden min-w-0 flex-1 overflow-x-auto min-[900px]:block">
        <div className="inline-flex gap-0.5 rounded-xl border border-border bg-secondary p-0.5">
          {options.map((option) => (
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
              {option.count != null && <span> · {option.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full min-[900px]:hidden">
        <Select
          value={value}
          onValueChange={(next) => {
            if (next) onChange(next as T)
          }}
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue>
              {(selectedValue) => {
                const selected = options.find((option) => option.value === selectedValue)
                if (!selected) return placeholder
                return (
                  <span>
                    {selected.label}
                    {selected.count != null && <span> · {selected.count}</span>}
                  </span>
                )
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                {option.count != null && <span> · {option.count}</span>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
