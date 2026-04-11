export function formatCurrency(amount, locale = 'en-IN', currency = 'INR') {
  if (amount == null) return ''
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPrice(amount) {
  if (amount == null) return ''
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

export function formatDate(date, options = {}) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export function slugify(text) {
  return text
    ?.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() || ''
}

export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function maskEmail(email) {
  if (!email) return ''
  const [user, domain] = email.split('@')
  return `${user.slice(0, 2)}***@${domain}`
}

export function maskPhone(phone) {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  return `****${digits.slice(-4)}`
}
