import { useState, useRef, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, ChevronDown, Menu, Phone } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useClickOutside } from '../../hooks'
// Demo mode: search is handled locally, no backend needed
import { CITIES } from '../../constants/navbar'
import Logo from './Logo'
import SearchDropdown from './SearchDropdown'
import CartDropdown from './CartDropdown'
import UserMenu from './UserMenu'

export default function Navbar() {
  const { user } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()

  const [city, setCity] = useState('Hyderabad')
  const [cityOpen, setCityOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])

  const searchRef = useRef(null)
  const userMenuRef = useRef(null)
  const cartRef = useRef(null)
  const cityRef = useRef(null)

  useClickOutside(searchRef, useCallback(() => setSearchFocused(false), []))
  useClickOutside(userMenuRef, useCallback(() => setUserMenuOpen(false), []))
  useClickOutside(cartRef, useCallback(() => setCartOpen(false), []))
  useClickOutside(cityRef, useCallback(() => setCityOpen(false), []))

  // Demo mode: no search history from backend

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchFocused(false)
    }
  }

  function handleSearchSelect(query) {
    setSearchQuery(query)
    navigate(`/search?q=${encodeURIComponent(query)}`)
    setSearchFocused(false)
  }

  function handleClearHistory() {
    setSearchHistory([])
  }

  const cartItemCount = cart.total_items || 0

  return (
    <>
      {/* Promo Banner */}
      <div className="bg-white text-center py-2.5 text-sm font-medium border-b border-gray-200">
        <span className="text-primary">Go rent free for 4 months! Get flat 50 % off per month. Hurry! Offer ends at midnight.</span>
        {' '}
        <Link to="/benefits" className="text-accent-orange hover:text-orange-600 font-semibold ml-1">
          Learn more &gt;
        </Link>
      </div>

      {/* Main Navbar */}
      <nav className="bg-dark sticky top-0 z-50">
        <div className="section-container flex items-center justify-between h-[64px] gap-3 sm:gap-6">
          {/* Left: Logo + City */}
          <div className="flex items-center gap-5 shrink-0">
            <Logo size="sm" dark={true} />

            {/* City Selector */}
            <div className="relative hidden sm:block" ref={cityRef}>
              <button
                onClick={() => setCityOpen(!cityOpen)}
                className="flex items-center gap-2 text-white text-sm hover:text-gray-300 transition-colors"
              >
                <span className="text-lg">🇮🇳</span>
                <span className="font-medium">{city}</span>
                <ChevronDown size={14} />
              </button>
              {cityOpen && (
                <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl py-2 min-w-[160px] z-50">
                  {CITIES.map(c => (
                    <button key={c} onClick={() => { setCity(c); setCityOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer ${c === city ? 'text-primary font-medium' : 'text-gray-700'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Search bar */}
          <div className="flex-1 max-w-xl hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="What are you looking for?"
                className="w-full bg-white rounded-lg px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="absolute right-0 top-0 bottom-0 bg-primary hover:bg-primary-dark text-white px-4 rounded-r-lg transition-colors">
                <Search size={18} />
              </button>
              <SearchDropdown
                searchQuery={searchQuery}
                searchFocused={searchFocused}
                searchHistory={searchHistory}
                onClearHistory={handleClearHistory}
                onSelect={handleSearchSelect}
              />
            </form>
          </div>

          {/* Right: Phone + Cart + User */}
          <div className="flex items-center gap-5 shrink-0">
            <a href="tel:+916765406376" className="hidden lg:flex items-center gap-2 text-white text-sm hover:text-gray-300 transition-colors">
              <Phone size={14} />
              <span>+91-6765406376</span>
            </a>

            {/* Cart */}
            <div className="relative" ref={cartRef}>
              <button onClick={() => setCartOpen(!cartOpen)} className="flex items-center gap-2 text-white text-sm hover:text-gray-300 relative">
                <div className="relative">
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent-orange text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-medium">Cart</span>
              </button>
              {cartOpen && <CartDropdown onClose={() => setCartOpen(false)} />}
            </div>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 text-white text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                    {user.full_name?.[0] || 'U'}
                  </div>
                  <span className="hidden sm:inline font-medium">{user.full_name?.split(' ')[0] || 'User'}</span>
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen && <UserMenu onClose={() => setUserMenuOpen(false)} />}
              </div>
            ) : (
              <Link to="/login" className="text-white text-sm font-semibold hover:text-gray-300">
                Login/ Signup
              </Link>
            )}

            <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 border-t border-white/10">
            <form onSubmit={handleSearch} className="relative mt-3">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="What are you looking for?"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-primary" />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={18} /></button>
            </form>
            <div className="flex items-center gap-2 mt-3 text-white text-sm">
              <span>🇮🇳</span>
              <select value={city} onChange={e => setCity(e.target.value)} className="bg-transparent text-white text-sm">
                {CITIES.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
              </select>
            </div>
            <a href="tel:+916765406376" className="flex items-center gap-2 text-white text-sm mt-3">
              <Phone size={14} /><span>+91-6765406376</span>
            </a>
          </div>
        )}
      </nav>
    </>
  )
}
