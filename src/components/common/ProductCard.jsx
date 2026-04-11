import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { handleImgError } from '../../constants/images'

export function ProductCardGrid({
  product,
  onWishlist,
  onAddToCart,
  onQuickView,
  className = '',
}) {
  const { name, slug, image, price, brand, category } = product

  return (
    <div className={`group bg-white rounded-xl border border-[#f2f2f2] overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      <Link to={`/product/${slug || name?.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="relative aspect-square bg-[#f8f8f8] overflow-hidden">
          <img
            src={image || product.image_url}
            alt={name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={handleImgError}
            loading="lazy"
          />
          {product.is_featured && (
            <span className="absolute top-3 left-3 bg-[#f97316] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Featured
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        {(brand || category) && (
          <p className="text-[11px] font-body text-[#828282] uppercase tracking-wide mb-1">
            {brand || category}
          </p>
        )}
        <Link to={`/product/${slug || name?.toLowerCase().replace(/\s+/g, '-')}`}>
          <h3 className="text-sm font-heading font-bold text-[#17113e] line-clamp-2 hover:text-[#6d5ed6] transition-colors">
            {name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-lg font-heading font-bold text-[#17113e]">
              {typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : price}
            </span>
            <span className="text-xs text-[#828282] font-body">/mo</span>
          </div>

          <div className="flex gap-1.5">
            {onWishlist && (
              <button
                onClick={(e) => { e.preventDefault(); onWishlist(product) }}
                className="p-1.5 rounded-full hover:bg-[#f2f2f2] text-[#828282] hover:text-red-500 cursor-pointer transition-colors"
              >
                <Heart className="h-4 w-4" />
              </button>
            )}
            {onQuickView && (
              <button
                onClick={(e) => { e.preventDefault(); onQuickView(product) }}
                className="p-1.5 rounded-full hover:bg-[#f2f2f2] text-[#828282] hover:text-[#6d5ed6] cursor-pointer transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            {onAddToCart && (
              <button
                onClick={(e) => { e.preventDefault(); onAddToCart(product) }}
                className="p-1.5 rounded-full hover:bg-[#6d5ed6]/10 text-[#828282] hover:text-[#6d5ed6] cursor-pointer transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductCardList({
  product,
  onWishlist,
  onAddToCart,
  className = '',
}) {
  const { name, slug, image, price, brand, category, description } = product

  return (
    <div className={`flex gap-4 bg-white rounded-xl border border-[#f2f2f2] p-4 hover:shadow-lg transition-shadow ${className}`}>
      <Link
        to={`/product/${slug || name?.toLowerCase().replace(/\s+/g, '-')}`}
        className="w-40 h-40 shrink-0 bg-[#f8f8f8] rounded-lg overflow-hidden"
      >
        <img
          src={image || product.image_url}
          alt={name}
          className="w-full h-full object-contain p-3"
          onError={handleImgError}
          loading="lazy"
        />
      </Link>

      <div className="flex-1 min-w-0">
        {(brand || category) && (
          <p className="text-[11px] font-body text-[#828282] uppercase tracking-wide mb-1">
            {brand || category}
          </p>
        )}
        <Link to={`/product/${slug || name?.toLowerCase().replace(/\s+/g, '-')}`}>
          <h3 className="text-sm font-heading font-bold text-[#17113e] hover:text-[#6d5ed6] transition-colors">
            {name}
          </h3>
        </Link>
        {description && (
          <p className="text-xs text-[#828282] font-body mt-1 line-clamp-2">{description}</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-lg font-heading font-bold text-[#17113e]">
              {typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : price}
            </span>
            <span className="text-xs text-[#828282] font-body">/mo</span>
          </div>

          <div className="flex gap-2">
            {onWishlist && (
              <button
                onClick={() => onWishlist(product)}
                className="p-2 rounded-full hover:bg-[#f2f2f2] text-[#828282] hover:text-red-500 cursor-pointer transition-colors"
              >
                <Heart className="h-4 w-4" />
              </button>
            )}
            {onAddToCart && (
              <button
                onClick={() => onAddToCart(product)}
                className="px-4 py-2 text-xs font-medium bg-[#6d5ed6] text-white rounded-full hover:bg-[#5a4bb8] cursor-pointer transition-colors"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCardGrid
