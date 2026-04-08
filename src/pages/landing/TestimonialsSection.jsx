import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { AVATAR_IMAGES, handleImgError } from '../../constants/images'

const testimonials = [
  {
    name: 'Benny Blanco',
    role: 'Manager at SBI MUTUAL FUND',
    text: 'I run a small business in commercial films and believe me I asked our client servicing team to get inspired by MultiLiving\'s Customer. I asked our client servicing team to get inspired by MultiLiving\'s Customer.',
    image: AVATAR_IMAGES.avatar1,
  },
  {
    name: 'Sarah Johnson',
    role: 'CTO at TechCorp',
    text: 'Rentr made it incredibly easy for us to scale our server infrastructure without the massive upfront costs. The service has been phenomenal.',
    image: AVATAR_IMAGES.avatar2,
  },
  {
    name: 'Rajesh Kumar',
    role: 'Director at Infosys',
    text: 'We have been using Rentr for over 2 years now and the experience has been seamless. Their support team is always available when we need them.',
    image: AVATAR_IMAGES.avatar3,
  },
]

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const testimonial = testimonials[activeIndex]

  const goUp = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1))
  }

  const goDown = () => {
    setActiveIndex((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0))
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left - Circular image with navigation arrows */}
          <div className="relative flex items-center gap-3 sm:gap-6">
            {/* Up/Down arrows */}
            <div className="flex flex-col gap-3">
              <button
                onClick={goUp}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronUp size={18} className="text-gray-500" />
              </button>
              <button
                onClick={goDown}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronDown size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Circular placeholder image */}
            <div className="w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full bg-gray-100 shrink-0 overflow-hidden">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-full h-full object-cover"
                onError={handleImgError}
                loading="lazy"
              />
            </div>
          </div>

          {/* Right - Testimonial content */}
          <div className="flex-1">
            <h2 className="font-heading text-[24px] md:text-[28px] font-bold text-dark mb-2">
              Our customers
            </h2>
            <div className="w-12 h-1 bg-accent-orange rounded mb-8" />

            <p className="text-base sm:text-[20px] md:text-[24px] text-gray-secondary leading-relaxed mb-8">
              "{testimonial.text}"
            </p>

            <p className="text-sm font-semibold text-dark">
              {testimonial.name}, <span className="font-normal text-gray-3">{testimonial.role}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
