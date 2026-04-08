import {
  ChevronRight, ChevronLeft, Bookmark, ZoomIn
} from 'lucide-react'
import { handleImgError } from '../../../constants/images'

export default function ProductImageGallery({
  product,
  selectedImage,
  setSelectedImage,
  wishlisted,
  setWishlisted,
  setImageZoomed,
}) {
  return (
    <>
      {/* Image Gallery */}
      <div className="relative bg-gray-100 rounded-none overflow-hidden h-[300px] sm:h-[400px] md:h-[500px]">
        <img
          src={product.images[selectedImage]}
          alt={product.name}
          className="w-full h-full object-contain p-8"
          onError={handleImgError}
        />

        {/* Wishlist button */}
        <button
          onClick={() => setWishlisted(!wishlisted)}
          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
        >
          <Bookmark size={18} className={wishlisted ? 'fill-primary text-primary' : 'text-gray-400'} />
        </button>

        {/* View All Images */}
        <button
          onClick={() => setImageZoomed(true)}
          className="absolute bottom-4 right-4 bg-dark/70 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-dark/90 transition-colors flex items-center gap-1.5"
        >
          <ZoomIn size={14} />
          View All Images
        </button>

        {/* Nav arrows */}
        <button
          onClick={() => setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-3">
        {product.images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedImage(i)}
            className={`w-16 h-16 border-2 rounded-lg overflow-hidden bg-white flex items-center justify-center p-1 transition-all shrink-0 ${
              selectedImage === i
                ? 'border-primary'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img src={img} alt="" className="max-h-full object-contain" onError={handleImgError} />
          </button>
        ))}
      </div>
    </>
  )
}
