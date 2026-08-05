import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RoleBadge } from './RoleBadge'

const LABELS = { admin: 'Admin', user: 'User' } as const

describe('RoleBadge', () => {
  it.each(['admin', 'user'] as const)('renders the label for %s', (role) => {
    render(<RoleBadge role={role} />)

    expect(screen.getByText(LABELS[role])).toBeInTheDocument()
  })
})
