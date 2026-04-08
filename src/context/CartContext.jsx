import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { cartApi } from '../services/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user, token } = useAuth()
  const [cart, setCart] = useState({ items: [], total_monthly: 0, total_items: 0 })
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!token) {
      setCart({ items: [], total_monthly: 0, total_items: 0 })
      return
    }
    try {
      setLoading(true)
      const data = await cartApi.get()
      setCart(data)
    } catch {
      setCart({ items: [], total_monthly: 0, total_items: 0 })
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCart({ items: [], total_monthly: 0, total_items: 0 })
    }
  }, [user, fetchCart])

  async function addItem(product_id, quantity = 1, rental_months = 1) {
    const data = await cartApi.addItem(product_id, quantity, rental_months)
    setCart(data)
    return data
  }

  async function updateItem(item_id, updates) {
    const data = await cartApi.updateItem(item_id, updates)
    setCart(data)
    return data
  }

  async function removeItem(item_id) {
    const data = await cartApi.removeItem(item_id)
    setCart(data)
    return data
  }

  async function clearCart() {
    await cartApi.clear()
    setCart({ items: [], total_monthly: 0, total_items: 0 })
  }

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
