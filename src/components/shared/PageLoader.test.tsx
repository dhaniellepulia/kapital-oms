import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PageLoader } from './PageLoader'

describe('PageLoader', () => {
  it('renders a main element with a skeleton', () => {
    const { container } = render(<PageLoader />)

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
  })
})
