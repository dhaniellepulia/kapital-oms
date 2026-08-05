import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SortControl } from './SortControl'

describe('SortControl', () => {
  it('renders both sort options', () => {
    render(<SortControl value="date" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Newest' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Amount' })).toBeInTheDocument()
  })

  it('fires onChange with date and amount', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SortControl value="date" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Newest' }))
    await user.click(screen.getByRole('button', { name: 'Amount' }))

    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenNthCalledWith(1, 'date')
    expect(onChange).toHaveBeenNthCalledWith(2, 'amount')
  })
})
