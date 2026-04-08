import { describe, it, expect } from 'vitest'
import { formatPrice, formatDate, slugify, truncate, maskEmail, maskPhone } from '../../utils/formatters'

describe('formatPrice', () => {
  it('formats number with INR symbol', () => {
    expect(formatPrice(3000)).toBe('₹3,000')
  })

  it('formats large numbers', () => {
    expect(formatPrice(25000)).toBe('₹25,000')
  })

  it('returns empty for null', () => {
    expect(formatPrice(null)).toBe('')
  })
})

describe('formatDate', () => {
  it('formats date string', () => {
    const result = formatDate('2024-01-15')
    expect(result).toContain('Jan')
    expect(result).toContain('2024')
  })

  it('returns empty for null', () => {
    expect(formatDate(null)).toBe('')
  })
})

describe('slugify', () => {
  it('converts to lowercase with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Dell PowerEdge T30!')).toBe('dell-poweredge-t30')
  })

  it('handles null', () => {
    expect(slugify(null)).toBe('')
  })
})

describe('truncate', () => {
  it('truncates long text', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...')
  })

  it('returns short text unchanged', () => {
    expect(truncate('Hi', 10)).toBe('Hi')
  })
})

describe('maskEmail', () => {
  it('masks email', () => {
    expect(maskEmail('john@example.com')).toBe('jo***@example.com')
  })
})

describe('maskPhone', () => {
  it('masks phone number', () => {
    expect(maskPhone('9876543210')).toBe('****3210')
  })
})
