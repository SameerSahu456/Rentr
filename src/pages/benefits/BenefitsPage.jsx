import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CreditCard,
  Receipt,
  RefreshCw,
  Landmark,
  ShieldCheck,
  Recycle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const benefitSlides = [
  [
    {
      icon: CreditCard,
      title: 'Pay as you use',
      description:
        'The rental model offers flexibility and makes sure that you pay only for your usage. This allows healthier cash flows for better financial health of your business.',
    },
    {
      icon: Receipt,
      title: 'Tax Advantages',
      description:
        'All the rental or leasing payments are 100% tax deductible unlike depreciation with IT ownership. Renting and leasing is an educated financial decision.',
    },
    {
      icon: RefreshCw,
      title: 'Hassle free refresh',
      description:
        "Technology changes every year. Why shouldn't you have the latest and the greatest? Rentr solves this with easy, no-cost upgrades whenever you need them.",
    },
  ],
  [
    {
      icon: Landmark,
      title: 'Financing with Rentr',
      description:
        'We help you in getting the best finance for your IT requirements. Renting and leasing is a smarter way to keep your business running with the latest technology.',
    },
    {
      icon: ShieldCheck,
      title: 'Service guarantee',
      description:
        'Rentr has a pan-India network of service partners. We assure you with service that is super fast and effective.',
    },
    {
      icon: Recycle,
      title: 'E-Waste disposal',
      description:
        'Equipment is that your footprint to the environment stays clean. We handle responsible recycling and disposal of all IT assets.',
    },
  ],
]

export default function BenefitsPage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const totalSlides = benefitSlides.length

  return (
    <div className="bg-dark-bg min-h-screen text-white">
      <section className="py-20 md:py-28">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left Column */}
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-tight">
                Benefits of
                <br />
                renting/leasing
                <br />
                with <span className="text-primary">Rentr</span>
              </h1>
              <p className="mt-8 text-gray-400 leading-relaxed text-base md:text-lg max-w-lg">
                Monitoring, maintaining, upgrading, and moving. It helps manage,
                visualize and automate the entire process of leasing &amp; renting
                IT infrastructure. Our software platform makes it easy to configure,
                purchase, finance, track and service assets in a fraction of the
                time typically required.
              </p>
              <Link
                to="/search"
                className="btn-primary rounded-full inline-block mt-10"
              >
                Explore Products
              </Link>
            </div>

            {/* Right Column -- Benefit Cards */}
            <div className="flex flex-col gap-5">
              {benefitSlides[activeSlide].map((benefit, i) => (
                <div
                  key={i}
                  className="bg-dark-surface/60 rounded-2xl p-7 flex items-start gap-5 hover:bg-dark-surface transition-colors group"
                >
                  <div className="w-14 h-14 shrink-0 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                    <benefit.icon size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* Pagination / Carousel Indicators */}
              <div className="flex items-center justify-end gap-4 mt-4 pr-2">
                <button
                  onClick={() =>
                    setActiveSlide((prev) =>
                      prev === 0 ? totalSlides - 1 : prev - 1
                    )
                  }
                  className="w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalSlides }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`rounded-full transition-all duration-300 ${
                        i === activeSlide
                          ? 'w-8 h-2.5 bg-primary'
                          : 'w-2.5 h-2.5 bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() =>
                    setActiveSlide((prev) =>
                      prev === totalSlides - 1 ? 0 : prev + 1
                    )
                  }
                  className="w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
