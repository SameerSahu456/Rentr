import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import usePagination from '../../hooks/usePagination'

describe('usePagination', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1)

  it('returns correct total pages', () => {
    const { result } = renderHook(() => usePagination(items, 10))
    expect(result.current.totalPages).toBe(3)
  })

  it('returns first page items by default', () => {
    const { result } = renderHook(() => usePagination(items, 10))
    expect(result.current.paginatedItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(result.current.currentPage).toBe(1)
  })

  it('navigates to page', () => {
    const { result } = renderHook(() => usePagination(items, 10))
    act(() => result.current.goToPage(2))
    expect(result.current.currentPage).toBe(2)
    expect(result.current.paginatedItems).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
  })

  it('last page has remaining items', () => {
    const { result } = renderHook(() => usePagination(items, 10))
    act(() => result.current.goToPage(3))
    expect(result.current.paginatedItems).toEqual([21, 22, 23, 24, 25])
  })

  it('clamps to valid page range', () => {
    const { result } = renderHook(() => usePagination(items, 10))
    act(() => result.current.goToPage(100))
    expect(result.current.currentPage).toBe(3) // max
    act(() => result.current.goToPage(0))
    expect(result.current.currentPage).toBe(1) // min
  })

  it('reset goes to page 1', () => {
    const { result } = renderHook(() => usePagination(items, 10))
    act(() => result.current.goToPage(3))
    act(() => result.current.reset())
    expect(result.current.currentPage).toBe(1)
  })

  it('handles empty items', () => {
    const { result } = renderHook(() => usePagination([], 10))
    expect(result.current.totalPages).toBe(0)
    expect(result.current.paginatedItems).toEqual([])
  })
})
