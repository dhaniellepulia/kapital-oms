import { format } from 'date-fns'

const phpFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPHP(value: number): string {
  return phpFormatter.format(value)
}

export function formatPercent(ratio: number, digits = 1): string {
  return `${(ratio * 100).toFixed(digits)}%`
}

export type DateInput = Date | string | number

export function formatDate(value: DateInput): string {
  return format(new Date(value), 'MMM d, yyyy')
}
