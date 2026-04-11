import { CAROUSEL_SLIDES } from '../../../constants/auth'

export default function SignupCarousel({ activeSlide, setActiveSlide }) {
  return (
    <div className="hidden lg:flex w-[420px] bg-gradient-to-b from-[#5b3ba3] to-[#3d2578] text-white flex-col items-center justify-center p-10 relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* Product showcase card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-8 w-full max-w-[300px]">
        {/* Mock product UI */}
        <div className="bg-white rounded-xl p-4 mb-3">
          {/* Mock browser dots */}
          <div className="flex gap-1.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>

          {activeSlide === 0 && (
            /* Slide 1: Product grid mockup */
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-heading font-bold text-gray-800">Our products</span>
                <div className="w-4 h-4 text-gray-300">...</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-md aspect-square flex items-center justify-center">
                    <div className="w-6 h-6 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <div className="h-6 bg-primary rounded-full flex-1" />
                <div className="h-6 bg-gray-100 rounded-full flex-1" />
              </div>
            </div>
          )}

          {activeSlide === 1 && (
            /* Slide 2: Rent/Lease toggle mockup */
            <div>
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex gap-2 mb-3">
                  <div className="h-8 bg-gray-100 rounded-lg flex-1 flex items-center justify-center">
                    <span className="text-[9px] text-gray-500 font-medium">Rent</span>
                  </div>
                  <div className="h-8 bg-primary rounded-lg flex-1 flex items-center justify-center">
                    <span className="text-[9px] text-white font-medium">Lease</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded-full w-3/4" />
                  <div className="h-2 bg-gray-200 rounded-full w-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-100 rounded-md h-16" />
                <div className="bg-gray-100 rounded-md h-16" />
              </div>
            </div>
          )}

          {activeSlide === 2 && (
            /* Slide 3: Duration slider mockup */
            <div>
              <p className="text-[10px] text-gray-600 font-medium mb-3">
                How long do you want to rent this for?
              </p>
              <div className="relative mb-3">
                <div className="h-1.5 bg-primary/30 rounded-full">
                  <div className="h-1.5 bg-primary rounded-full w-3/4" />
                </div>
                <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-5 h-5 bg-primary rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="text-[7px] text-white font-bold">5.5</span>
                </div>
              </div>
              <div className="flex justify-between">
                {['3 months', '4 months', '5 months', '6 months'].map((m) => (
                  <span key={m} className="text-[8px] text-gray-400">{m}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Carousel text content */}
      <div className="relative z-10 text-center px-4">
        <h3 className="font-heading text-lg font-bold mb-3">
          {CAROUSEL_SLIDES[activeSlide].title}
        </h3>
        <p className="text-white/70 text-xs font-body leading-relaxed">
          {CAROUSEL_SLIDES[activeSlide].description}
        </p>
      </div>

      {/* Carousel dots */}
      <div className="flex gap-2 mt-8 relative z-10">
        {CAROUSEL_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
              idx === activeSlide ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
