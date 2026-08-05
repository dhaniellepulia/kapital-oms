import { describe, expect, it } from 'vitest'

import { orderSchema } from './orderSchema'

const base = {
  itemName: 'Widget',
  quantity: 3,
  capital: 100,
  sellingAmount: 150,
  deliveryFee: 10,
  paymentDate: '2026-01-01',
  notes: '',
}

describe('orderSchema', () => {
  it('coerces a numeric string quantity', () => {
    const result = orderSchema.safeParse({ ...base, quantity: '3' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.quantity).toBe(3)
    }
  })

  it('rejects a non-numeric quantity string', () => {
    const result = orderSchema.safeParse({ ...base, quantity: 'abc' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Quantity is required')
    }
  })

  it('rejects an empty quantity string as below minimum', () => {
    const result = orderSchema.safeParse({ ...base, quantity: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('At least 1')
    }
  })

  it('rejects an undefined quantity', () => {
    const result = orderSchema.safeParse({ ...base, quantity: undefined })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Quantity is required')
    }
  })

  it('rejects a fractional quantity', () => {
    const result = orderSchema.safeParse({ ...base, quantity: 2.5 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Must be a whole number')
    }
  })

  it('rejects a zero quantity', () => {
    const result = orderSchema.safeParse({ ...base, quantity: 0 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('At least 1')
    }
  })

  it('rejects a negative capital', () => {
    const result = orderSchema.safeParse({ ...base, capital: -1 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Cannot be negative')
    }
  })

  it('passes a decimal capital', () => {
    const result = orderSchema.safeParse({ ...base, capital: 12.5 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.capital).toBe(12.5)
    }
  })

  it('rejects an empty payment date', () => {
    const result = orderSchema.safeParse({ ...base, paymentDate: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Payment date is required')
    }
  })

  it('passes when notes is undefined or an empty string', () => {
    expect(orderSchema.safeParse({ ...base, notes: undefined }).success).toBe(true)
    expect(orderSchema.safeParse({ ...base, notes: '' }).success).toBe(true)
  })

  it('rejects a null notes value', () => {
    const result = orderSchema.safeParse({ ...base, notes: null })
    expect(result.success).toBe(false)
  })
})
