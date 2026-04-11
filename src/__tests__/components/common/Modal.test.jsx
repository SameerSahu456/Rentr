import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Modal from '../../../components/common/Modal'

describe('Modal', () => {
  it('renders children', () => {
    render(<Modal onClose={() => {}}>Modal Content</Modal>)
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('shows close button by default', () => {
    render(<Modal onClose={() => {}}>Content</Modal>)
    const closeBtn = screen.getByRole('button')
    expect(closeBtn).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(<Modal onClose={onClose}>Content</Modal>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn()
    render(<Modal onClose={onClose}>Content</Modal>)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('hides close button when showClose is false', () => {
    render(<Modal onClose={() => {}} showClose={false}>Content</Modal>)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('applies custom maxWidth', () => {
    const { container } = render(
      <Modal onClose={() => {}} maxWidth="max-w-2xl">Content</Modal>
    )
    const dialog = container.querySelector('.max-w-2xl')
    expect(dialog).toBeTruthy()
  })
})
