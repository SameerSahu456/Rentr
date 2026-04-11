import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { handleImgError } from '../../constants/images'
import HeroSection from './HeroSection'
import BenefitsSection from './BenefitsSection'
import TestimonialsSection from './TestimonialsSection'
import FAQSection from './FAQSection'
import CTABanner from './CTABanner'
import ProductCarouselSection from '../../components/modules/landing/ProductCarouselSection'
import SaveBanner from '../../components/modules/landing/SaveBanner'
import BrandPartners from '../../components/modules/landing/BrandPartners'
import {
  PRODUCT_TABS, CATEGORIES
} from '../../constants/landing'
import { saleorProducts } from '../../services/saleor'

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('Products')

  const [bestSellers, setBestSellers] = useState([])
  const [educationProducts, setEducationProducts] = useState([])

  useEffect(() => {
    saleorProducts.getFeatured(6)
      .then(setBestSellers)
      .catch(err => console.error('[Saleor] Failed to fetch featured:', err))
    saleorProducts.list({ pageSize: 6, sortBy: 'newest' })
      .then(r => setEducationProducts(r.products))
      .catch(err => console.error('[Saleor] Failed to fetch products:', err))
  }, [])

  return (
    <div>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Product Categories Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="section-container">
          {/* Tabs */}
          <div className="flex items-center gap-4 sm:gap-8 mb-8 border-b border-gray-200 overflow-x-auto">
            {PRODUCT_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'text-dark font-bold border-b-2 border-dark'
                    : 'text-gray-3 hover:text-gray-secondary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Category circles */}
          <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/products/${cat.name.toLowerCase()}`}
                className="flex flex-col items-center gap-3 shrink-0"
              >
                <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden border border-gray-300 shadow-sm">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" onError={handleImgError} loading="lazy" />
                </div>
                <span className="text-xs md:text-sm text-gray-secondary font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Best Sellers Section */}
      <ProductCarouselSection title="BEST SELLERS" products={bestSellers} />

      {/* 4. Save upto 15% CTA Banner */}
      <SaveBanner />

      {/* 5. Featured in Education Industry */}
      <ProductCarouselSection title="FEATURED IN EDUCATION INDUSTRY" products={educationProducts} />

      {/* 6. Why You Should Rent */}
      <BenefitsSection />

      {/* 7. Testimonials */}
      <TestimonialsSection />

      {/* 8. FAQ */}
      <FAQSection />

      {/* 9. Brand Partners */}
      <BrandPartners />

      {/* 10. Limited Offer CTA */}
      <CTABanner />
    </div>
  )
}
