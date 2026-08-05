import { describe, expect, it } from 'vitest'

import { loginSchema } from './loginSchema'

describe('loginSchema', () => {
  it('rejects an empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'secret' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email is required')
    }
  })

  it.each(['foo', 'foo@', 'foo@bar'])('rejects malformed email %s', (email) => {
    const result = loginSchema.safeParse({ email, password: 'secret' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Enter a valid email')
    }
  })

  it('rejects a whitespace-only email with the valid-email message', () => {
    const result = loginSchema.safeParse({ email: '   ', password: 'secret' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Enter a valid email')
    }
  })

  it('passes a valid email', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'secret' })
    expect(result.success).toBe(true)
  })

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password is required')
    }
  })

  it('accepts any non-empty password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'x' })
    expect(result.success).toBe(true)
  })

  it('strips unknown keys', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'x', extra: 1 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ email: 'a@b.com', password: 'x' })
    }
  })
})
