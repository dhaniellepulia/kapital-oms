import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { AccountUnavailable } from './AccountUnavailable'

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: {
    refreshProfile: vi.fn(),
    signOut: vi.fn(),
  },
}))

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}))

describe('AccountUnavailable', () => {
  it('renders the message and action buttons', () => {
    render(<AccountUnavailable />)

    expect(screen.getByText("Couldn't load your account")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
  })

  it('calls refreshProfile and shows a pending state while retrying', async () => {
    let resolveRefresh: (() => void) | undefined
    mockAuth.refreshProfile.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveRefresh = resolve
        }),
    )
    const user = userEvent.setup()
    render(<AccountUnavailable />)

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(mockAuth.refreshProfile).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Retrying…' })).toBeDisabled()

    await act(async () => {
      resolveRefresh?.()
    })
    expect(await screen.findByRole('button', { name: 'Try again' })).toBeEnabled()
  })

  it('shows an error when refreshProfile rejects', async () => {
    mockAuth.refreshProfile.mockRejectedValueOnce(new Error('offline'))
    const user = userEvent.setup()
    render(<AccountUnavailable />)

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(
      await screen.findByText("Still can't reach the server. Try again in a moment."),
    ).toBeInTheDocument()
  })

  it('calls signOut', async () => {
    const user = userEvent.setup()
    render(<AccountUnavailable />)

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(mockAuth.signOut).toHaveBeenCalledTimes(1)
  })
})
