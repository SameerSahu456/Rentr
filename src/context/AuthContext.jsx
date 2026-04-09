import { createContext, useContext, useState, useEffect } from 'react'
import { saleorAuth } from '../services/saleor'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      saleorAuth.getMe(token)
        .then(saleorUser => {
          setUser(saleorUser)
        })
        .catch(() => {
          // Token expired — try refresh
          const refreshTk = localStorage.getItem('refreshToken')
          if (refreshTk) {
            saleorAuth.refreshToken(refreshTk)
              .then(result => {
                localStorage.setItem('token', result.token)
                setToken(result.token)
                return saleorAuth.getMe(result.token)
              })
              .then(saleorUser => setUser(saleorUser))
              .catch(() => {
                logout()
              })
          } else {
            logout()
          }
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchUser() {
    if (!token) return
    const saleorUser = await saleorAuth.getMe(token)
    setUser(saleorUser)
  }

  async function login(email, password, role = 'customer') {
    const result = await saleorAuth.login(email, password)
    localStorage.setItem('token', result.token)
    localStorage.setItem('refreshToken', result.refreshToken)
    setToken(result.token)
    // Override role from login selection if Saleor doesn't have it
    const userWithRole = { ...result.user, role: result.user.role || role }
    setUser(userWithRole)
  }

  async function register({ email, password, firstName, lastName, phone, companyName, role, industry, gstin, companyPan }) {
    const result = await saleorAuth.register({
      email, password, firstName, lastName, phone, companyName, role, industry, gstin, companyPan,
    })
    // Auto-login after registration
    await login(email, password, role)
    return result
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
