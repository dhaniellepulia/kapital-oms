import { describe, expect, it } from 'vitest'

import { getAuthErrorMessage } from './authErrors'

describe('getAuthErrorMessage', () => {
  it.each(['auth/invalid-credential', 'auth/invalid-login-credentials', 'auth/user-not-found', 'auth/wrong-password'])(
    'maps %s to the incorrect credentials message',
    (code) => {
      expect(getAuthErrorMessage({ code })).toBe('Incorrect email or password.')
    },
  )

  it('maps email-already-in-use', () => {
    expect(getAuthErrorMessage({ code: 'auth/email-already-in-use' })).toBe(
      'An account with this email already exists.',
    )
  })

  it('maps weak-password', () => {
    expect(getAuthErrorMessage({ code: 'auth/weak-password' })).toBe('Password should be at least 6 characters.')
  })

  it('maps too-many-requests', () => {
    expect(getAuthErrorMessage({ code: 'auth/too-many-requests' })).toBe('Too many attempts. Try again later.')
  })

  it('maps network-request-failed', () => {
    expect(getAuthErrorMessage({ code: 'auth/network-request-failed' })).toBe(
      'Network error. Check your connection.',
    )
  })

  it.each([
    ['unknown code', { code: 'auth/unknown' }],
    ['missing code', {}],
    ['null', null],
    ['undefined', undefined],
    ['string', 'auth/invalid-credential'],
    ['number', 42],
    ['numeric code', { code: 42 }],
  ] as const)('falls back to the generic message for %s', (_label, error) => {
    expect(getAuthErrorMessage(error)).toBe('Something went wrong. Please try again.')
  })
})
