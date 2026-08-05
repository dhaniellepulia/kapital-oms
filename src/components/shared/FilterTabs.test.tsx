import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FilterTabs } from './FilterTabs'

const options = [
  { value: 'all', label: 'All', count: 12 },
  { value: 'open', label: 'Open', count: 3 },
]

describe('FilterTabs', () => {
  it('calls onChange when the All tab is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <FilterTabs
        value="all"
        onChange={onChange}
        options={options}
        placeholder="Filter by status"
      />,
    )

    await user.click(screen.getByRole('button', { name: /All/ }))

    expect(onChange).toHaveBeenCalledWith('all')
  })

  it('calls onChange when the Open tab is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <FilterTabs
        value="all"
        onChange={onChange}
        options={options}
        placeholder="Filter by status"
      />,
    )

    await user.click(screen.getByRole('button', { name: /Open/ }))

    expect(onChange).toHaveBeenCalledWith('open')
  })

  it('renders the mobile placeholder when no option matches', () => {
    render(
      <FilterTabs
        value=""
        onChange={vi.fn()}
        options={options}
        placeholder="Filter by status"
      />,
    )

    expect(screen.getByText('Filter by status')).toBeInTheDocument()
  })
})
