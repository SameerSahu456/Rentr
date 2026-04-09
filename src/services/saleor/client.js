import { GraphQLClient } from 'graphql-request'

const SALEOR_API_URL = import.meta.env.VITE_SALEOR_API_URL
const SALEOR_CHANNEL = import.meta.env.VITE_SALEOR_CHANNEL || 'default-channel'

if (!SALEOR_API_URL) {
  console.warn('[Saleor] VITE_SALEOR_API_URL is not set. Saleor integration will not work.')
}

const client = new GraphQLClient(SALEOR_API_URL || '', {
  headers: { 'Content-Type': 'application/json' },
})

export class SaleorError extends Error {
  constructor(errors) {
    const message = errors.map(e => e.message || e.field).join(', ')
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

export { SALEOR_CHANNEL }
