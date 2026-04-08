import { useState } from 'react'
import HeroQuoteModal from '../../components/modules/landing/HeroQuoteModal'
import { PRODUCT_IMAGES, handleImgError } from '../../constants/images'

export default function HeroSection() {
  const [showQuoteModal, setShowQuoteModal] = useState(false)

  return (
    <>
      <section className="bg-[#dcdcde]">
        <div className="section-container py-10 md:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-10 min-h-0 md:min-h-[500px] lg:min-h-[617px]">
            {/* Left - White card */}
            <div className="flex-1 w-full">
              <div className="bg-white rounded-2xl p-8 md:p-12 max-w-xl">
                <span className="inline-block bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-5">
                  Limited offer
                </span>
                <h1 className="font-heading text-[28px] md:text-[35px] font-bold text-dark capitalize leading-tight mb-4">
                  Save Big On Servers For Your Business
                </h1>
                <p className="text-gray-3 text-sm mb-8 max-w-md leading-relaxed">
                  Save 20% off on all servers with our exclusive annual package
                </p>
                <button
                  onClick={() => setShowQuoteModal(true)}
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-semibold text-sm transition-colors"
                >
                  Get quote
                </button>
              </div>
            </div>

            {/* Right - Product image area */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-lg min-h-[300px] md:min-h-[400px] flex items-center justify-center">
                <img
                  src={PRODUCT_IMAGES.heroServersMain}
                  alt="Server infrastructure"
                  className="w-full h-full object-contain"
                  onError={handleImgError}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Quote Modal */}
      {showQuoteModal && <HeroQuoteModal onClose={() => setShowQuoteModal(false)} />}
    </>
  )
}
