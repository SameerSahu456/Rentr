export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone) {
  const digits = phone?.replace(/\D/g, '') || ''
  return digits.length === 10
}

export function isValidOtp(otp) {
  if (Array.isArray(otp)) return otp.join('').length === 4
  return /^\d{4}$/.test(otp)
}

export function isValidPassword(password, minLength = 8) {
  return password && password.length >= minLength
}

export function isValidGst(gst) {
  return /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(gst)
}

export function isValidPan(pan) {
  return /^[A-Z]{5}\d{4}[A-Z]$/.test(pan)
}
