import { describe, expect, it } from 'vitest'

import { formatPHP, formatPercent, formatDate } from './format'

describe('formatPHP', () => {
  it('formats a number as PHP currency', () => {
    expect(formatPHP(1234.5)).toBe('₱1,234.50')
  })

  it('formats zero', () => {
    expect(formatPHP(0)).toBe('₱0.00')
  })
})

describe('formatPercent', () => {
  it('formats a ratio as a percentage', () => {
    expect(formatPercent(0.125)).toBe('12.5%')
  })

  it('respects the digits argument', () => {
    expect(formatPercent(0.125, 2)).toBe('12.50%')
  })
})

describe('formatDate', () => {
  it('formats a Date', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('Jan 5, 2026')
  })

  it('formats a string date', () => {
    expect(formatDate('2026-03-15')).toBe('Mar 15, 2026')
  })
})
