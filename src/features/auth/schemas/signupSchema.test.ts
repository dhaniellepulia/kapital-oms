import { describe, expect, it } from 'vitest'

import { signupSchema } from './signupSchema'

const valid = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'secret1',
  confirmPassword: 'secret1',
}

describe('signupSchema', () => {
  it('rejects a name that is too short', () => {
    const result = signupSchema.safeParse({ ...valid, name: 'J' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Enter your full name')
    }
  })

  it('rejects a password shorter than 6 characters', () => {
    const result = signupSchema.safeParse({ ...valid, password: '12345', confirmPassword: '12345' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password must be at least 6 characters')
    }
  })

  it('rejects mismatched passwords with the error on the confirmPassword path', () => {
    const result = signupSchema.safeParse({ ...valid, password: 'secret1', confirmPassword: 'secret2' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'confirmPassword')
      expect(issue?.message).toBe('Passwords do not match')
    }
  })

  it('passes valid data', () => {
    const result = signupSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(valid)
    }
  })
})
