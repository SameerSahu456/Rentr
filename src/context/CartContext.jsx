import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { saleorCheckout } from '../services/saleor'

const CartContext = createContext(null)

const EMPTY_CART = { items: [], total_monthly: 0, total_items: 0 }

function recalcCart(items) {
  const total_monthly = items.reduce((s, i) => s + (i.price_per_month || 0) * i.quantity, 0)
  const total_items = items.reduce((s, i) => s + i.quantity, 0)
  return { items, total_monthly, total_items }
}

let nextCartItemId = 100

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(EMPTY_CART)
  const [loading] = useState(false)

  const fetchCart = useCallback(async () => {
    // Demo mode: cart is managed locally, nothing to fetch
  }, [])

  useEffect(() => {
    if (!user) setCart(EMPTY_CART)
  }, [user])

  async function addItem(product_id, quantity = 1, rental_months = 1) {
    setCart(prev => {
      const existing = prev.items.find(i => i.product_id === product_id)
      let items
      if (existing) {
        items = prev.items.map(i =>
          i.product_id === product_id ? { ...i, quantity: i.quantity + quantity } : i
        )
      } else {
        items = [...prev.items, {
          id: nextCartItemId++,
          product_id,
          product_name: `Product #${product_id}`,
          product_image: '/images/products/server-tower.svg',
          price_per_month: 3000,
          quantity,
          rental_months,
        }]
      }
      return recalcCart(items)
    })
  }

  async function updateItem(item_id, updates) {
    setCart(prev => {
      const items = prev.items.map(i => i.id === item_id ? { ...i, ...updates } : i)
      return recalcCart(items)
    })
  }

  async function removeItem(item_id) {
    setCart(prev => {
      const items = prev.items.filter(i => i.id !== item_id)
      return recalcCart(items)
    })
  }

  async function clearCart() {
    setCart(EMPTY_CART)
  }

  async function applyPromoCode(promoCode) {
    try {
      const result = await saleorCheckout.applyPromoCode(cart.checkoutId, promoCode)
      if (result.discount) {
        setCart(prev => ({
          ...prev,
          discount: result.discount.amount,
          total_with_discount: result.totalPrice?.amount || prev.total_monthly,
        }))
      }
      return result
    } catch (err) {
      throw err
    }
  }

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addItem, updateItem, removeItem, clearCart, applyPromoCode }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
