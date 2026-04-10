import { GraphQLClient } from 'graphql-request'

const SALEOR_API_URL = import.meta.env.VITE_SALEOR_API_URL
const SALEOR_CHANNEL = import.meta.env.VITE_SALEOR_CHANNEL || 'default-channel'

if (!SALEOR_API_URL) {
  console.warn('[Saleor] VITE_SALEOR_API_URL is not set. Saleor integration will not work.')
}

const client = new GraphQLClient(SALEOR_API_URL || '', {
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

export class SaleorError extends Error {
  constructor(errors) {
    const message = errors.map(e => e.field ? `${e.field}: ${e.message}` : e.message).join(', ')
    super(message)
    this.name = 'SaleorError'
    this.errors = errors
  }
}

export async function saleorRequest(query, variables = {}, token = null) {
  const headers = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const vars = { ...variables }
  if (!vars.channel) {
    vars.channel = SALEOR_CHANNEL
  }

  const data = await client.request(query, vars, headers)
  return data
}

// Base URL for rewriting thumbnail/media URLs from localhost to the public tunnel
const SALEOR_BASE_URL = SALEOR_API_URL ? SALEOR_API_URL.replace('/graphql/', '') : ''

export function rewriteMediaUrl(url) {
  if (!url) return ''
  // Replace localhost:8000 references with the public Saleor base URL
  if (url.includes('localhost:8000') || url.includes('localhost:8001')) {
    return url.replace(/http:\/\/localhost:800[01]/, SALEOR_BASE_URL)
  }
  return url
}

export { SALEOR_CHANNEL }
