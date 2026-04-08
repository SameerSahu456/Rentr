import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Pagination from '../../../components/common/Pagination'

describe('Pagination', () => {
  it('renders nothing for single page', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders page buttons', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('highlights current page', () => {
    render(<Pagination currentPage={2} totalPages={3} onPageChange={() => {}} />)
    const btn = screen.getByText('2')
    expect(btn.className).toContain('bg-[#6d5ed6]')
  })

  it('calls onPageChange when page clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByText('2'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables prev on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeDisabled()  // prev button
  })

  it('disables next on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[buttons.length - 1]).toBeDisabled()  // next button
  })
})
