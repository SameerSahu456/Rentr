import { Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { handleImgError } from '../../../constants/images'

export default function SimilarProducts({
  similarProducts,
  carouselRef,
  scrollCarousel,
}) {
  return (
    <div className="bg-white border-t border-gray-200">
      <div className="section-container py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-lg font-bold text-dark uppercase tracking-wide">
            <span className="border-b-2 border-primary pb-1">Recommended Servers For You</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollCarousel(-1)}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollCarousel(1)}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {similarProducts.map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.slug}`}
              className="shrink-0 w-[200px] md:w-[226px] bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="aspect-square bg-gray-50 p-4 flex items-center justify-center">
                <img
                  src={p.image}
                  alt={p.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                  onError={handleImgError}
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <h3 className="text-xs font-medium text-dark mb-1 line-clamp-2">{p.name}</h3>
                <p className="text-sm font-semibold text-dark">
                  ₹{p.price.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/month</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
