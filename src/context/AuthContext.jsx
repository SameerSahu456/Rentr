import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Hardcoded demo user for offline demo
const DEMO_USER = {
  id: 1,
  email: 'sameer@rentr.com',
  full_name: 'sameer sahu',
  phone: '+919876543210',
  role: 'customer',
  company_name: 'Rentr Demo Corp',
  company_gst: 'GST1234567890',
  created_at: '2025-01-01T00:00:00Z',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      // Restore demo user from token without hitting backend
      const savedRole = localStorage.getItem('demo-role') || 'customer'
      setUser({ ...DEMO_USER, role: savedRole })
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [token])

  async function fetchUser() {
    // Demo mode: just set the hardcoded user
    setUser(DEMO_USER)
  }

  async function login(role = 'customer') {
    const fakeToken = 'demo-token-rentr'
    localStorage.setItem('token', fakeToken)
    localStorage.setItem('demo-role', role)
    setToken(fakeToken)
    setUser({ ...DEMO_USER, role })
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
