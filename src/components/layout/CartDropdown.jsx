import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { handleImgError } from '../../constants/images'

export default function CartDropdown({ onClose }) {
  const { cart } = useCart()
  const items = cart.items || []

  return (
    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl z-50 w-[calc(100vw-2rem)] sm:w-80">
      <div className="p-4 max-h-72 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Your cart is empty</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                  {item.product_image && (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover"
                      onError={handleImgError} loading="lazy" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.product_name || 'Product'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Tenure: {item.rental_months} Months</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">Rent: &#8377;{(item.price_per_month || 0).toLocaleString('en-IN')}/mo</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {items.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Link to="/checkout" onClick={onClose}
            className="block w-full bg-primary hover:bg-primary-dark text-white text-sm font-semibold text-center py-2.5 rounded-lg transition-colors">
            Proceed with payment
          </Link>
        </div>
      )}
    </div>
  )
}
