const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(endpoint, options = {}) {
  const { body, headers = {}, auth = false, ...rest } = options

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? getAuthHeaders() : {}),
      ...headers,
    },
    ...rest,
  }

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, config)

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new ApiError(
      data.detail || `Request failed with status ${res.status}`,
      res.status,
      data
    )
  }

  if (res.status === 204) return null
  return res.json()
}

// Auth
export const authApi = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),

  register: (data) =>
    request('/auth/register', { method: 'POST', body: data }),

  requestOtp: (phone) =>
    request('/auth/otp/request', { method: 'POST', body: { phone } }),

  verifyOtp: (phone, otp) =>
    request('/auth/otp/verify', { method: 'POST', body: { phone, otp } }),

  refreshToken: (refresh_token) =>
    request('/auth/refresh', { method: 'POST', body: { refresh_token } }),
}

// Users
export const usersApi = {
  getMe: () =>
    request('/users/me', { auth: true }),

  updateProfile: (data) =>
    request('/users/me', { method: 'PATCH', body: data, auth: true }),

  updateCompany: (data) =>
    request('/users/me/company', { method: 'PATCH', body: data, auth: true }),

  changePassword: (data) =>
    request('/users/me/change-password', { method: 'POST', body: data, auth: true }),
}

// Products
export const productsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    ).toString()
    return request(`/products${query ? `?${query}` : ''}`)
  },

  getFeatured: () =>
    request('/products/featured'),

  getCategories: () =>
    request('/products/categories'),

  getBrands: () =>
    request('/products/brands'),

  getBySlug: (slug) =>
    request(`/products/${slug}`),
}

// Cart
export const cartApi = {
  get: () =>
    request('/cart', { auth: true }),

  addItem: (product_id, quantity = 1, rental_months = 1) =>
    request('/cart/items', {
      method: 'POST',
      body: { product_id, quantity, rental_months },
      auth: true,
    }),

  updateItem: (item_id, data) =>
    request(`/cart/items/${item_id}`, { method: 'PATCH', body: data, auth: true }),

  removeItem: (item_id) =>
    request(`/cart/items/${item_id}`, { method: 'DELETE', auth: true }),

  clear: () =>
    request('/cart', { method: 'DELETE', auth: true }),
}

// Orders
export const ordersApi = {
  create: (rental_months, shipping_address) =>
    request('/orders', {
      method: 'POST',
      body: { rental_months, shipping_address },
      auth: true,
    }),

  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null)
    ).toString()
    return request(`/orders${query ? `?${query}` : ''}`, { auth: true })
  },

  getById: (id) =>
    request(`/orders/${id}`, { auth: true }),
}

// Search
export const searchApi = {
  autocomplete: (q, limit = 5) =>
    request(`/search/autocomplete?q=${encodeURIComponent(q)}&limit=${limit}`),

  results: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    ).toString()
    return request(`/search/results?${query}`, { auth: true })
  },

  getHistory: () =>
    request('/search/history', { auth: true }),

  clearHistory: () =>
    request('/search/history', { method: 'DELETE', auth: true }),
}

export { ApiError }
export default { authApi, usersApi, productsApi, cartApi, ordersApi, searchApi }
