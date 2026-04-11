import { Link } from 'react-router-dom'

export default function CTABanner() {
  return (
    <section className="bg-[#fafafa] py-10 md:py-14">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <span className="inline-block bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shrink-0">
              Limited offer
            </span>
            <h2 className="font-heading text-lg md:text-xl font-bold text-dark">
              Upto 6000 off on 90% products for renting today!
            </h2>
          </div>

          {/* Right */}
          <Link
            to="/search"
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full text-sm font-semibold transition-colors shrink-0"
          >
            Get quote now
          </Link>
        </div>
      </div>
    </section>
  )
}
