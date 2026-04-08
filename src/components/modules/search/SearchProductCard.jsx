import { Link } from 'react-router-dom'
import { handleImgError } from '../../../constants/images'
import { useAuth } from '../../../context/AuthContext'
import { useCart } from '../../../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function getProductImage(product) {
  return product.image_url || product.image || '/images/products/server-tower.svg'
}

function getProductPrice(product) {
  return product.price_per_month ?? product.price ?? 0
}

export function SearchProductCardGrid({ product }) {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-200"
    >
      <div className="aspect-square bg-gray-50 flex items-center justify-center p-6">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
          onError={handleImgError}
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <h4 className="font-heading font-medium text-sm text-dark leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h4>
        <p className="font-heading font-bold text-sm text-dark mt-1.5">
          ₹{getProductPrice(product).toLocaleString('en-IN')}
          <span className="text-gray-400 text-xs font-normal">/month</span>
        </p>
      </div>
    </Link>
  )
}

export function SearchProductCardList({ product }) {
  const { user } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setAdding(true)
    try {
      await addItem(product.id)
    } catch { /* ignore */ }
    setAdding(false)
  }

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 py-5 border-b border-gray-100 group">
      <Link
        to={`/product/${product.slug}`}
        className="w-full sm:w-40 h-32 bg-gray-50 rounded-lg flex items-center justify-center p-4 shrink-0 border border-gray-100"
      >
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
          onError={handleImgError}
          loading="lazy"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/product/${product.slug}`}>
          <h4 className="font-heading font-semibold text-base text-dark group-hover:text-primary transition-colors">
            {product.name}
          </h4>
        </Link>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
          {product.description}
        </p>
        <p className="font-heading font-bold text-base text-dark mt-2">
          ₹{getProductPrice(product).toLocaleString('en-IN')}
          <span className="text-gray-400 text-xs font-normal">/month</span>
        </p>
      </div>
      <button
        onClick={handleAddToCart}
        disabled={adding}
        className="shrink-0 bg-primary text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto disabled:opacity-60"
      >
        {adding ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  )
}
