import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { handleImgError } from '../../../constants/images'

export default function ProductCarouselSection({ title, products }) {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -260 : 260
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-10 bg-white">
      <div className="section-container">
        {/* Title with orange underline */}
        <div className="mb-8">
          <h2 className="font-heading text-[18px] md:text-[20px] font-bold text-gray-1 uppercase tracking-wide">
            {title}
          </h2>
          <div className="w-10 h-1 bg-accent-orange rounded mt-2" />
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-300 items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-500" />
          </button>

          {/* Products row */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.slug}`}
                className="shrink-0 w-[200px] md:w-[226px] border border-[#f2f2f2] rounded-[9px] p-4 hover:shadow-md transition-shadow bg-white group"
              >
                <div className="w-full h-[120px] md:h-[140px] bg-gray-50 rounded-lg mb-3 flex items-center justify-center p-3">
                  <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" onError={handleImgError} loading="lazy" />
                </div>
                <h3 className="text-[14px] md:text-[16px] font-medium text-gray-secondary mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                <p className="text-[13px] md:text-[14px] text-gray-3">&#8377;{p.price}/month</p>
              </Link>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-300 items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        </div>
      </div>
    </section>
  )
}
