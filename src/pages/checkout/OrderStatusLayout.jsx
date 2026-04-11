import { useState } from 'react'
import { Link } from 'react-router-dom'
import { handleImgError } from '../../constants/images'
import {
  ChevronRight,
  ChevronLeft,
  Star,
  Truck,
  Shield,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const RECOMMENDED_PRODUCTS = [
  {
    id: 1,
    image: '/images/products/server-tower.svg',
    name: 'Dell PowerEdge R740',
    specs: 'Intel Xeon Silver, 32 GB RAM',
    pricePerMonth: 28500,
  },
  {
    id: 2,
    image: '/images/products/rack-server.svg',
    name: 'HPE ProLiant DL360',
    specs: 'Intel Xeon Gold, 64 GB RAM',
    pricePerMonth: 35000,
  },
  {
    id: 3,
    image: '/images/products/desktop.svg',
    name: 'Lenovo ThinkSystem SR650',
    specs: 'Intel Xeon Platinum, 128 GB RAM',
    pricePerMonth: 52000,
  },
  {
    id: 4,
    image: '/images/products/laptop.svg',
    name: 'Server Rack 42U',
    specs: '42U Standard Rack, Cable Mgmt',
    pricePerMonth: 3092,
  },
]

const TRUST_BADGES = [
  {
    icon: Truck,
    title: 'Our Delivery Service',
    description: 'Fast and reliable delivery across India with real-time tracking.',
  },
  {
    icon: Shield,
    title: 'Our Return Policy',
    description: 'Hassle-free returns within 7 days of delivery.',
  },
  {
    icon: MessageCircle,
    title: '24/7 Support',
    description: 'Round-the-clock customer support via chat, email, and phone.',
  },
]

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-1 text-sm mb-6 flex-wrap" style={{ color: '#828282' }}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={14} />}
          {item.to ? (
            <Link to={item.to} className="hover:text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span style={{ color: '#333' }} className="font-medium">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}

function StatusHeader({ icon: Icon, iconColor, iconBg, heading, subtitle, subtitleHighlight }) {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={40} style={{ color: iconColor }} />
      </div>
      <h1
        className="font-heading font-bold mb-2 text-xl sm:text-2xl"
        style={{ color: '#17113e' }}
      >
        {heading}
      </h1>
      {subtitle && (
        <p className="max-w-lg" style={{ fontSize: '14px', color: '#4f4f4f' }}>
          {typeof subtitle === 'string' ? subtitle : subtitle}
        </p>
      )}
    </div>
  )
}

function DetailRow({ label, value, isBold }) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-200 last:border-b-0">
      <span style={{ fontSize: '14px', color: '#828282' }}>{label}</span>
      <span
        className="text-right max-w-[55%]"
        style={{ fontSize: '14px', color: '#333', fontWeight: isBold ? 600 : 400 }}
      >
        {value}
      </span>
    </div>
  )
}

function SummaryRow({ label, value, isBold, isTotal }) {
  return (
    <div
      className={`flex justify-between items-center py-2 ${isTotal ? 'border-t border-gray-300 mt-1 pt-3' : ''}`}
    >
      <span
        style={{
          fontSize: isTotal ? '15px' : '14px',
          color: isTotal ? '#17113e' : '#828282',
          fontWeight: isTotal ? 700 : 400,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: isTotal ? '16px' : '14px',
          color: isTotal ? '#17113e' : '#333',
          fontWeight: isBold || isTotal ? 700 : 400,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function NPSFeedback() {
  const [selected, setSelected] = useState(null)
  const [comment, setComment] = useState('')

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm mt-8">
      <h3
        className="font-heading font-bold mb-1"
        style={{ fontSize: '18px', color: '#17113e' }}
      >
        How are we doing?
      </h3>
      <p className="mb-5" style={{ fontSize: '13px', color: '#828282' }}>
        On a scale of 0-10, how likely are you to recommend Rentr to a friend or colleague?
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className="w-10 h-10 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer border"
            style={{
              backgroundColor: selected === i ? '#6d5ed6' : '#fff',
              color: selected === i ? '#fff' : '#333',
              borderColor: selected === i ? '#6d5ed6' : '#e5e7eb',
            }}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs mb-5" style={{ color: '#828282' }}>
        <span>Not likely at all</span>
        <span>Extremely likely</span>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Any additional comments? (optional)"
        className="input-field-rect h-24 resize-none"
      />

      <button className="btn-primary mt-4 text-sm">Submit Feedback</button>
    </div>
  )
}

function TrustBadges() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
      {TRUST_BADGES.map((badge) => (
        <div key={badge.title} className="flex flex-col items-center text-center p-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
            style={{ backgroundColor: '#f0eef9' }}
          >
            <badge.icon size={24} style={{ color: '#6d5ed6' }} />
          </div>
          <h4 className="font-heading font-semibold mb-1" style={{ fontSize: '15px', color: '#17113e' }}>
            {badge.title}
          </h4>
          <p style={{ fontSize: '13px', color: '#828282' }}>{badge.description}</p>
        </div>
      ))}
    </div>
  )
}

function ContactUs() {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm mt-8">
      <h3
        className="font-heading font-bold mb-1"
        style={{ fontSize: '18px', color: '#17113e' }}
      >
        Feel free to Contact Us
      </h3>
      <p className="mb-5" style={{ fontSize: '13px', color: '#828282' }}>
        We are here to help. Reach out to us through any of the following channels.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200">
          <Phone size={20} style={{ color: '#6d5ed6' }} />
          <div>
            <p className="text-xs" style={{ color: '#828282' }}>Phone</p>
            <p className="text-sm font-medium" style={{ color: '#333' }}>+91 98765 43210</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200">
          <Mail size={20} style={{ color: '#6d5ed6' }} />
          <div>
            <p className="text-xs" style={{ color: '#828282' }}>Email</p>
            <p className="text-sm font-medium" style={{ color: '#333' }}>support@rentr.in</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200">
          <MapPin size={20} style={{ color: '#6d5ed6' }} />
          <div>
            <p className="text-xs" style={{ color: '#828282' }}>Office</p>
            <p className="text-sm font-medium" style={{ color: '#333' }}>Mumbai, India</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecommendedProducts() {
  const scrollRef = useState(null)
  const [scrollPos, setScrollPos] = useState(0)

  const scroll = (dir) => {
    const container = scrollRef[0]
    if (!container) return
    const amount = 260
    container.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
    setScrollPos(container.scrollLeft + (dir === 'left' ? -amount : amount))
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-5">
        <h3
          className="font-heading font-bold"
          style={{ fontSize: '18px', color: '#17113e' }}
        >
          Recommended Products
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} style={{ color: '#333' }} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ChevronRight size={18} style={{ color: '#333' }} />
          </button>
        </div>
      </div>

      <div
        ref={(el) => { scrollRef[0] = el }}
        className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {RECOMMENDED_PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="min-w-[220px] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-shrink-0"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-36 object-cover"
              onError={handleImgError}
              loading="lazy"
            />
            <div className="p-4">
              <h4
                className="font-heading font-semibold mb-1 truncate"
                style={{ fontSize: '14px', color: '#17113e' }}
              >
                {product.name}
              </h4>
              <p className="text-xs mb-2 truncate" style={{ color: '#828282' }}>
                {product.specs}
              </p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i < 4 ? '#f59e0b' : 'none'}
                    stroke={i < 4 ? '#f59e0b' : '#d1d5db'}
                  />
                ))}
              </div>
              <p className="font-semibold" style={{ fontSize: '14px', color: '#6d5ed6' }}>
                ₹{product.pricePerMonth.toLocaleString('en-IN')}/mo
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Order Details Card                                                 */
/* ------------------------------------------------------------------ */

export function OrderDetailsCard({ title, children, summaryItems }) {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
      <h2
        className="font-heading font-bold mb-5"
        style={{ fontSize: '18px', color: '#17113e' }}
      >
        {title}
      </h2>

      <div className="mb-5">{children}</div>

      {summaryItems && (
        <>
          <div className="border-t border-gray-300 pt-4 mt-2">
            <h4
              className="font-heading font-semibold mb-3"
              style={{ fontSize: '15px', color: '#17113e' }}
            >
              Summary
            </h4>
            {summaryItems.map((item, i) => (
              <SummaryRow key={i} {...item} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Layout                                                        */
/* ------------------------------------------------------------------ */

export default function OrderStatusLayout({
  breadcrumbItems,
  icon,
  iconColor,
  iconBg,
  heading,
  subtitle,
  detailsCard,
  showFeedback = false,
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f6fb' }}>
      <div className="section-container py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Status header */}
        <StatusHeader
          icon={icon}
          iconColor={iconColor}
          iconBg={iconBg}
          heading={heading}
          subtitle={subtitle}
        />

        {/* Dashboard CTA */}
        <div className="flex justify-center mb-8">
          <Link to="/dashboard" className="btn-primary text-sm">
            Go to your Dashboard
          </Link>
        </div>

        {/* Details card */}
        <div className="max-w-2xl mx-auto">
          {detailsCard}

          {/* NPS Feedback */}
          {showFeedback && <NPSFeedback />}

          {/* Trust badges */}
          <TrustBadges />

          {/* Contact us */}
          <ContactUs />

          {/* Recommended products */}
          <RecommendedProducts />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Exports for reuse                                                  */
/* ------------------------------------------------------------------ */

export { DetailRow, SummaryRow }
