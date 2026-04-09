import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Truck,
  Shield,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  MapPin,
  Mail,
  Zap,
} from 'lucide-react'

function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-300 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span
          className="font-heading font-semibold text-dark text-lg sm:text-[22px]"
          style={{ color: '#17113e' }}
        >
          {title}
        </span>
        {open ? (
          <ChevronUp size={20} className="text-primary shrink-0" />
        ) : (
          <ChevronDown size={20} className="text-gray-400 shrink-0" />
        )}
      </button>
      {open && (
        <div
          className="pb-6 leading-relaxed"
          style={{ fontSize: '14px', color: '#4f4f4f' }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

const trustBadges = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'For all orders to any location',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure payment gateway',
  },
  {
    icon: MessageCircle,
    title: '24/7 Online Support',
    description: 'Dedicated support staff available round the clock',
  },
]

export { CollapsibleSection }

export default function PolicyPageLayout({ title, subtitle, sections }) {
  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-b from-gray-50 to-white pt-16 sm:pt-20 md:pt-24 pb-10 sm:pb-14">
        <div className="section-container text-center max-w-3xl">
          <h1
            className="font-heading font-bold text-2xl sm:text-[28px] md:text-[34px]"
            style={{ color: '#17113e' }}
          >
            {title}
          </h1>
          <div className="mt-3 mx-auto w-16 h-1 rounded-full bg-primary" />
          {subtitle && (
            <p
              className="mt-5 max-w-2xl mx-auto leading-relaxed"
              style={{ fontSize: '15px', color: '#828282' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 bg-white">
        <div className="section-container max-w-3xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-6 sm:px-8">
            {sections.map((section, i) => (
              <CollapsibleSection
                key={i}
                title={section.title}
                defaultOpen={i === 0}
              >
                {typeof section.content === 'string' ? (
                  <p>{section.content}</p>
                ) : (
                  section.content
                )}
              </CollapsibleSection>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Card */}
      <section className="py-12 bg-gray-50">
        <div className="section-container max-w-3xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2
              className="font-heading font-bold mb-6"
              style={{ fontSize: '22px', color: '#17113e' }}
            >
              Contact Us
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin
                  size={20}
                  className="text-primary shrink-0 mt-0.5"
                />
                <p style={{ fontSize: '14px', color: '#4f4f4f' }}>
                  209, B Wing, Sona Udyog, Parsi Panchayat Road, Andheri (E),
                  Mumbai - 400 069.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-primary shrink-0" />
                <div style={{ fontSize: '14px', color: '#4f4f4f' }}>
                  <p>
                    Support:{' '}
                    <a
                      href="mailto:Support@comprint.co.in"
                      className="text-primary hover:underline"
                    >
                      Support@comprint.co.in
                    </a>
                  </p>
                  <p className="mt-1">
                    Sales:{' '}
                    <a
                      href="mailto:sales@comprint.co.in"
                      className="text-primary hover:underline"
                    >
                      sales@comprint.co.in
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white">
        <div className="section-container max-w-3xl">
          <div className="grid sm:grid-cols-3 gap-6">
            {trustBadges.map((badge, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <badge.icon size={22} className="text-primary" />
                </div>
                <h3
                  className="font-heading font-semibold mb-1"
                  style={{ fontSize: '16px', color: '#17113e' }}
                >
                  {badge.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#828282' }}>
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-14 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-navy to-dark-bg" />
        <div className="relative z-10 text-center section-container">
          <span className="inline-block bg-accent-orange text-white text-[10px] md:text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-5">
            Limited offer
          </span>
          <h2 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Upto 6000 off on 90% products for renting today!
          </h2>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 mt-8 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
          >
            <Zap size={16} />
            Rent Now
          </Link>
        </div>
      </section>
    </div>
  )
}
