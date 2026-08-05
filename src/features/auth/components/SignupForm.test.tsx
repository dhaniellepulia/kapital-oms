import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SignupForm } from './SignupForm'

describe('SignupForm', () => {
  it('shows all required errors and does not submit an empty form', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<SignupForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByText('Enter your full name')).toBeInTheDocument()
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    expect(screen.getByText('Confirm your password')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects mismatched passwords', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<SignupForm onSubmit={onSubmit} />)

    await user.type(await screen.findByLabelText('Full name'), 'Maria Santos')
    await user.type(await screen.findByLabelText('Email'), 'a@b.com')
    await user.type(await screen.findByLabelText('Password'), 'secret1')
    await user.type(await screen.findByLabelText('Confirm password'), 'secret2')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects a password shorter than 6 characters', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<SignupForm onSubmit={onSubmit} />)

    await user.type(await screen.findByLabelText('Full name'), 'Maria Santos')
    await user.type(await screen.findByLabelText('Email'), 'a@b.com')
    await user.type(await screen.findByLabelText('Password'), 'abc')
    await user.type(await screen.findByLabelText('Confirm password'), 'abc')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits valid signup values', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<SignupForm onSubmit={onSubmit} />)

    await user.type(await screen.findByLabelText('Full name'), 'Maria Santos')
    await user.type(await screen.findByLabelText('Email'), 'a@b.com')
    await user.type(await screen.findByLabelText('Password'), 'secret1')
    await user.type(await screen.findByLabelText('Confirm password'), 'secret1')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Maria Santos',
      email: 'a@b.com',
      password: 'secret1',
      confirmPassword: 'secret1',
    })
  })
})
