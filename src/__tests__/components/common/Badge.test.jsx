import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Badge from '../../../components/common/Badge'

describe('Badge', () => {
  it('renders status text', () => {
    render(<Badge status="active" />)
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('renders children when provided', () => {
    render(<Badge status="active">Custom Text</Badge>)
    expect(screen.getByText('Custom Text')).toBeInTheDocument()
  })

  it('applies green style for active status', () => {
    render(<Badge status="active" />)
    expect(screen.getByText('active').className).toContain('bg-green-100')
  })

  it('applies red style for cancelled status', () => {
    render(<Badge status="cancelled" />)
    expect(screen.getByText('cancelled').className).toContain('bg-red-100')
  })

  it('applies default style for unknown status', () => {
    render(<Badge status="unknown" />)
    expect(screen.getByText('unknown').className).toContain('bg-gray-100')
  })

  it('applies custom className', () => {
    render(<Badge status="active" className="ml-2" />)
    expect(screen.getByText('active').className).toContain('ml-2')
  })
})
