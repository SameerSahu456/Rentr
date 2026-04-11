import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { handleImgError } from '../../constants/images'

const WISHLIST_ITEMS = [
  { id: 1, name: 'PowerEdge T30 Mini Tower Server', slug: 'dell-poweredge-t30-mini-tower-server', price: '₹3,000/month', image: '/images/products/poweredge-t30.png' },
  { id: 2, name: 'Inspiron 24 5000 All-In-One Desktop', slug: 'dell-optiplex-7010-micro-desktop', price: '₹12,000/month', image: '/images/products/inspiron-24-5000.png' },
  { id: 3, name: 'Dell PowerEdge R730xd Rack Server', slug: 'dell-poweredge-r740-rack-server', price: '₹22,000/month', image: '/images/products/dell-r730xd.png' },
  { id: 4, name: 'Dell PowerEdge T40 Tower Server', slug: 'dell-poweredge-t40-tower-server', price: '₹33,000/month', image: '/images/products/poweredge-t30.png' },
  { id: 5, name: 'Inspiron 24 5000 All-In-One Desktop', slug: 'dell-optiplex-7010-micro-desktop', price: '₹19,000/month', image: '/images/products/inspiron-24-5000.png' },
  { id: 6, name: 'Dell PowerEdge R730xd Rack Server', slug: 'dell-poweredge-r740-rack-server', price: '₹3,000/month', image: '/images/products/dell-r730xd.png' },
  { id: 7, name: 'PowerEdge T30 Mini Tower Server', slug: 'dell-poweredge-t30-mini-tower-server', price: '₹12,000/month', image: '/images/products/poweredge-t30.png' },
  { id: 8, name: 'Inspiron 24 5000 All-In-One Desktop', slug: 'dell-optiplex-7010-micro-desktop', price: '₹22,000/month', image: '/images/products/inspiron-24-5000.png' },
  { id: 9, name: 'Dell PowerEdge R730xd Rack Server', slug: 'dell-poweredge-r740-rack-server', price: '₹33,000/month', image: '/images/products/dell-r730xd.png' },
  { id: 10, name: 'PowerEdge T30 Mini Tower Server', slug: 'dell-poweredge-t30-mini-tower-server', price: '₹19,000/month', image: '/images/products/poweredge-t30.png' },
]

export default function WishlistPage() {
  const [items, setItems] = useState(WISHLIST_ITEMS)

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="section-container py-10">
        <h1 className="font-heading text-2xl font-bold text-gray-1 uppercase tracking-wide">My Wishlist</h1>
        <div className="w-10 h-0.5 bg-primary mt-2 mb-8" />

        {items.length === 0 ? (
          <div className="py-16">
            <h2 className="font-heading text-xl font-bold text-gray-1 mb-2">Your wishlist is empty!</h2>
            <p className="text-sm text-gray-3 mb-6">Explore more items in our library and shortlist your favourites</p>
            <Link
              to="/search"
              className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors inline-block"
            >
              Explore catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map((item) => (
              <div key={item.id} className="relative group">
                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2 right-2 z-10 w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>

                {/* Product Image */}
                <div className="bg-[#f8f8f8] rounded-lg aspect-square flex items-center justify-center mb-3 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain p-4" onError={handleImgError} loading="lazy" />
                </div>

                {/* Product Info */}
                <Link to={`/product/${item.slug}`} className="block">
                  <h3 className="text-sm font-medium text-gray-1 leading-snug">{item.name}</h3>
                  <p className="text-sm text-gray-3 mt-1">{item.price}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
