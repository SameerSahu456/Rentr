import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Tabs from '../../../components/common/Tabs'

describe('Tabs', () => {
  const tabs = ['Tab1', 'Tab2', 'Tab3']

  it('renders all tabs', () => {
    render(<Tabs tabs={tabs} active="Tab1" onChange={() => {}} />)
    expect(screen.getByText('Tab1')).toBeInTheDocument()
    expect(screen.getByText('Tab2')).toBeInTheDocument()
    expect(screen.getByText('Tab3')).toBeInTheDocument()
  })

  it('highlights active tab', () => {
    render(<Tabs tabs={tabs} active="Tab2" onChange={() => {}} />)
    const btn = screen.getByText('Tab2')
    expect(btn.className).toContain('bg-[#6d5ed6]')
  })

  it('calls onChange on tab click', () => {
    const onChange = vi.fn()
    render(<Tabs tabs={tabs} active="Tab1" onChange={onChange} />)
    fireEvent.click(screen.getByText('Tab3'))
    expect(onChange).toHaveBeenCalledWith('Tab3')
  })

  it('supports object tabs with key/label', () => {
    const objTabs = [
      { key: 'a', label: 'Alpha' },
      { key: 'b', label: 'Beta' },
    ]
    const onChange = vi.fn()
    render(<Tabs tabs={objTabs} active="a" onChange={onChange} />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Beta'))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('renders pill variant', () => {
    render(<Tabs tabs={tabs} active="Tab1" onChange={() => {}} variant="pill" />)
    const btn = screen.getByText('Tab1')
    expect(btn.className).toContain('rounded-full')
  })

  it('renders underline variant', () => {
    render(<Tabs tabs={tabs} active="Tab1" onChange={() => {}} variant="underline" />)
    const btn = screen.getByText('Tab1')
    expect(btn.className).toContain('border-b-2')
  })
})
