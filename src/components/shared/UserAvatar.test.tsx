import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { getInitials, UserAvatar } from './UserAvatar'

describe('getInitials', () => {
  it.each([
    ['Maria Santos', 'MS'],
    ['ali', 'A'],
    ['', '?'],
    ['  ', '?'],
    ['Jean-Luc Picard', 'JP'],
  ])('returns "%s" for "%s"', (name, expected) => {
    expect(getInitials(name)).toBe(expected)
  })
})

describe('UserAvatar', () => {
  it('renders the initials', () => {
    render(<UserAvatar name="Maria Santos" />)

    expect(screen.getByText('MS')).toBeInTheDocument()
  })
})
