import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    render(
      <ConfirmDialog open={false} onOpenChange={vi.fn()} title="Delete item" onConfirm={vi.fn()} />,
    )

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders content and fires confirm and cancel callbacks', async () => {
    const onOpenChange = vi.fn()
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Delete item"
        description="This action cannot be undone."
        onConfirm={onConfirm}
      />,
    )

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Delete item' })).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onOpenChange.mock.calls[0][0]).toBe(false)
  })

  it('disables the confirm button while pending', async () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={vi.fn()}
        title="Delete item"
        confirmLabel="Delete"
        isPending
        onConfirm={vi.fn()}
      />,
    )

    expect(await screen.findByRole('button', { name: 'Delete' })).toBeDisabled()
  })
})
