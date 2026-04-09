import { saleorRequest, SaleorError } from './client'
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_SLUG_QUERY,
  CATEGORIES_QUERY,
  TOKEN_CREATE_MUTATION,
  TOKEN_REFRESH_MUTATION,
  ACCOUNT_REGISTER_MUTATION,
  ME_QUERY,
  MY_ORDERS_QUERY,
  CHECKOUT_ADD_PROMO_CODE,
} from './queries'
import {
  unwrapEdges,
  transformProductForList,
  transformProductForDetail,
  transformCategories,
  transformUser,
  transformOrderForHistory,
} from './transforms'

// ─── Products ───

function mapSortBy(sortBy) {
  switch (sortBy) {
    case 'price-low': return { field: 'PRICE', direction: 'ASC' }
    case 'price-high': return { field: 'PRICE', direction: 'DESC' }
    case 'newest': return { field: 'CREATED_AT', direction: 'DESC' }
    case 'name': return { field: 'NAME', direction: 'ASC' }
    case 'popularity': return { field: 'RATING', direction: 'DESC' }
    default: return { field: 'CREATED_AT', direction: 'DESC' }
  }
}

export const saleorProducts = {
  async list({ search, category, brands, priceMin, priceMax, sortBy, page = 1, pageSize = 16 } = {}) {
    const filter = {}
    if (search) filter.search = search
    if (category) filter.categories = [category]
    if (priceMin || priceMax) {
      filter.price = {}
      if (priceMin) filter.price.gte = Number(priceMin)
      if (priceMax) filter.price.lte = Number(priceMax)
    }

    const variables = {
      first: pageSize,
      after: page > 1 ? btoa(`arrayconnection:${(page - 1) * pageSize - 1}`) : undefined,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      sortBy: sortBy ? mapSortBy(sortBy) : undefined,
    }

    const data = await saleorRequest(PRODUCTS_QUERY, variables)
    const nodes = unwrapEdges(data.products)
    const products = nodes.map(transformProductForList)
    const totalCount = data.products?.totalCount || 0

    return {
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      pageInfo: data.products?.pageInfo,
    }
  },

  async getBySlug(slug) {
    const data = await saleorRequest(PRODUCT_BY_SLUG_QUERY, { slug })
    if (!data.product) return null
    return transformProductForDetail(data.product)
  },

  async getFeatured(limit = 6) {
    const data = await saleorRequest(PRODUCTS_QUERY, {
      first: limit,
      sortBy: { field: 'RATING', direction: 'DESC' },
    })
    const nodes = unwrapEdges(data.products)
    return nodes.map(transformProductForList)
  },

  async getCategories() {
    const data = await saleorRequest(CATEGORIES_QUERY, { first: 100 })
    const nodes = unwrapEdges(data.categories)
    return transformCategories(nodes)
  },

  async getBrands() {
    const data = await saleorRequest(PRODUCTS_QUERY, { first: 100 })
    const nodes = unwrapEdges(data.products)
    const brands = new Set()
    nodes.forEach(node => {
      const brand = node.metadata?.find(m => m.key === 'brand')?.value
      if (brand) brands.add(brand)
    })
    return Array.from(brands)
  },
}

// ─── Auth ───

export const saleorAuth = {
  async login(email, password) {
    const data = await saleorRequest(TOKEN_CREATE_MUTATION, { email, password })
    const result = data.tokenCreate
    if (result.errors?.length) {
      throw new SaleorError(result.errors)
    }
    return {
      token: result.token,
      refreshToken: result.refreshToken,
      user: transformUser(result.user),
    }
  },

  async register({ email, password, firstName, lastName, phone, companyName, role, industry, gstin, companyPan }) {
    const metadata = []
    if (phone) metadata.push({ key: 'phone', value: phone })
    if (role) metadata.push({ key: 'role', value: role })
    if (companyName) metadata.push({ key: 'company_name', value: companyName })
    if (industry) metadata.push({ key: 'industry', value: industry })
    if (gstin) metadata.push({ key: 'company_gst', value: gstin })
    if (companyPan) metadata.push({ key: 'company_pan', value: companyPan })

    const input = {
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      channel: import.meta.env.VITE_SALEOR_CHANNEL || 'default-channel',
      metadata,
    }

    const data = await saleorRequest(ACCOUNT_REGISTER_MUTATION, { input })
    const result = data.accountRegister
    if (result.errors?.length) {
      throw new SaleorError(result.errors)
    }
    return { user: transformUser(result.user) }
  },

  async refreshToken(refreshToken) {
    const data = await saleorRequest(TOKEN_REFRESH_MUTATION, { refreshToken })
    const result = data.tokenRefresh
    if (result.errors?.length) {
      throw new SaleorError(result.errors)
    }
    return { token: result.token }
  },

  async getMe(token) {
    const data = await saleorRequest(ME_QUERY, {}, token)
    return transformUser(data.me)
  },
}

// ─── Orders ───

export const saleorOrders = {
  async getMyOrders(token, first = 20, after = null) {
    const data = await saleorRequest(MY_ORDERS_QUERY, { first, after }, token)
    const orders = unwrapEdges(data.me?.orders)
    return {
      orders: orders.map(transformOrderForHistory),
      totalCount: data.me?.orders?.totalCount || 0,
      pageInfo: data.me?.orders?.pageInfo,
    }
  },
}

// ─── Checkout / Promotions ───

export const saleorCheckout = {
  async applyPromoCode(checkoutId, promoCode, token) {
    const data = await saleorRequest(CHECKOUT_ADD_PROMO_CODE, { id: checkoutId, promoCode }, token)
    const result = data.checkoutAddPromoCode
    if (result.errors?.length) {
      throw new SaleorError(result.errors)
    }
    return {
      discount: result.checkout?.discount,
      totalPrice: result.checkout?.totalPrice?.gross,
    }
  },
}
