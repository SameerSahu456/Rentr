import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import useOtpTimer from '../../hooks/useOtpTimer'

describe('useOtpTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with initial seconds', () => {
    const { result } = renderHook(() => useOtpTimer(120))
    expect(result.current.timer).toBe(120)
    expect(result.current.minutes).toBe('02')
    expect(result.current.seconds).toBe('00')
  })

  it('counts down', () => {
    const { result } = renderHook(() => useOtpTimer(5))
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.timer).toBe(2)
  })

  it('stops at 0', () => {
    const { result } = renderHook(() => useOtpTimer(2))
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.timer).toBe(0)
    expect(result.current.expired).toBe(true)
  })

  it('formats minutes and seconds correctly', () => {
    const { result } = renderHook(() => useOtpTimer(90))
    expect(result.current.minutes).toBe('01')
    expect(result.current.seconds).toBe('30')
  })

  it('reset restores timer', () => {
    const { result } = renderHook(() => useOtpTimer(60))
    act(() => vi.advanceTimersByTime(30000))
    expect(result.current.timer).toBe(30)
    act(() => result.current.reset())
    expect(result.current.timer).toBe(60)
  })
})
