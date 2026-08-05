import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('renders the current value as a percentage', () => {
    render(<ProgressBar value={0.5} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
  })

  it('clamps values above 1', () => {
    render(<ProgressBar value={1.5} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('clamps values below 0', () => {
    render(<ProgressBar value={-0.5} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('accepts a smaller size', () => {
    render(<ProgressBar value={0.25} size="sm" />)

    expect(screen.getByRole('progressbar').firstElementChild).toBeInTheDocument()
  })
})
