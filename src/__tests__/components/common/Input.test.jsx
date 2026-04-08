import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Input from '../../../components/common/Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders required indicator', () => {
    render(<Input label="Name" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<Input label="Email" error="Invalid email" />)
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
  })

  it('applies error styling', () => {
    render(<Input error="Error" />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-red-300')
  })

  it('handles value change', () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('applies rounded shape by default', () => {
    render(<Input />)
    expect(screen.getByRole('textbox').className).toContain('rounded-full')
  })

  it('applies rect shape', () => {
    render(<Input shape="rect" />)
    expect(screen.getByRole('textbox').className).toContain('rounded-lg')
  })
})
