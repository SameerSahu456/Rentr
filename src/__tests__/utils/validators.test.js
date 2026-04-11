import { describe, it, expect } from 'vitest'
import { isValidEmail, isValidPhone, isValidOtp, isValidPassword } from '../../utils/validators'

describe('isValidEmail', () => {
  it('accepts valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(isValidEmail('not-email')).toBe(false)
    expect(isValidEmail('missing@')).toBe(false)
    expect(isValidEmail('@domain.com')).toBe(false)
  })
})

describe('isValidPhone', () => {
  it('accepts 10-digit phone', () => {
    expect(isValidPhone('9876543210')).toBe(true)
  })

  it('strips non-digits', () => {
    expect(isValidPhone('+91-9876543210')).toBe(false) // 12 digits with country code
  })

  it('rejects short phone', () => {
    expect(isValidPhone('12345')).toBe(false)
  })
})

describe('isValidOtp', () => {
  it('accepts 4-digit array', () => {
    expect(isValidOtp(['1', '2', '3', '4'])).toBe(true)
  })

  it('rejects incomplete array', () => {
    expect(isValidOtp(['1', '2', '', '4'])).toBe(false)
  })

  it('accepts 4-digit string', () => {
    expect(isValidOtp('1234')).toBe(true)
  })

  it('rejects non-numeric string', () => {
    expect(isValidOtp('abcd')).toBe(false)
  })
})

describe('isValidPassword', () => {
  it('accepts 8+ chars', () => {
    expect(isValidPassword('password123')).toBe(true)
  })

  it('rejects short password', () => {
    expect(isValidPassword('short')).toBe(false)
  })

  it('rejects empty', () => {
    expect(isValidPassword('')).toBeFalsy()
  })
})
