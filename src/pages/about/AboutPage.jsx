import { Link } from 'react-router-dom'
import { handleImgError } from '../../constants/images'
import {
  ChevronDown,
  ChevronRight,
  CreditCard,
  Landmark,
  Play,
  Receipt,
  Recycle,
  RefreshCw,
  Settings,
  ShieldCheck,
  TrendingDown,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'

/* ───────────────── Data ───────────────── */

const benefitCards = [
  {
    title: 'Tax Advantages',
    description:
      'All the rental or leasing payments are 100% tax deductible unlike depreciation with IT ownership. Renting and leasing is an educated financial decision.',
    icon: Receipt,
    color: '#6d5ed6',
  },
  {
    title: 'Pay as you use',
    description:
      'The rental model offers flexibility and makes sure that you pay only for your usage. This allows healthier cash flows for better financial health.',
    icon: CreditCard,
    color: '#f97316',
  },
  {
    title: 'Hassle free refresh',
    description:
      "Technology changes every year. Why shouldn't you have the latest and the greatest? Rentr solves this with easy – no cost upgrades.",
    icon: RefreshCw,
    color: '#22c55e',
  },
  {
    title: 'Service guarantee',
    description:
      'We have a pan India network of service partners that will provide you with service that is super-fast and effective.',
    icon: Wrench,
    color: '#eab308',
  },
  {
    title: 'Financing with Rentr',
    description:
      'We help you with getting the finances for your IT infrastructure with our NBFC partners.',
    icon: Landmark,
    color: '#3b82f6',
  },
  {
    title: 'E-Waste disposal',
    description:
      'We have an efficient system to recycle old IT equipment so that your footprint to the environment stays minimal.',
    icon: Recycle,
    color: '#10b981',
  },
  {
    title: 'Pay less, use more',
    description:
      'The longer you rent for, the lesser you pay. Our pricing is fair and offers you the maximum savings. As the tenure increases, so do your savings.',
    icon: TrendingDown,
    color: '#ef4444',
  },
  {
    title: 'No manual intervention',
    description:
      'Our high end systems allow us to automate everything from the verification process to the monthly bill calculation. This means lesser manual intervention, fewer errors, and a trustworthy process for you.',
    icon: Settings,
    color: '#8b5cf6',
  },
  {
    title: 'One time approval',
    description:
      'Place multiple orders without going through the verification process over and over.',
    icon: ShieldCheck,
    color: '#06b6d4',
  },
]

const avatarImages = [
  '/images/avatars/avatar-1.svg',
  '/images/avatars/avatar-2.svg',
  '/images/avatars/avatar-3.svg',
  '/images/avatars/avatar-4.svg',
]

const testimonials = [
  { name: 'Benny Blanco', company: 'SBI Mutual fund', text: 'Rentr has transformed the way we manage our IT infrastructure. The seamless rental process and excellent support make it a no-brainer for businesses.' },
  { name: 'Benny Blanco', company: 'SBI Mutual fund', text: 'We saved significantly on upfront costs while always having access to the latest technology. Highly recommend Rentr!' },
  { name: 'Benny Blanco', company: 'SBI Mutual fund', text: 'The hassle-free refresh policy is a game changer. We never worry about outdated equipment anymore.' },
  { name: 'Benny Blanco', company: 'SBI Mutual fund', text: 'Outstanding service and support. Rentr made scaling our IT operations incredibly easy and cost-effective.' },
]

const faqCategories = [
  'Signing Up with us',
  'Subscription',
  'Delivery and Installation',
  'Service and Maintainence',
]

const faqs = {
  'Signing Up with us': [
    {
      question: 'How many months warranty does the product come with?',
      answer:
        'All rental products come with a comprehensive warranty for the entire duration of your rental tenure. This covers hardware defects, component failures, and performance issues at no additional cost.',
    },
    {
      question: 'Why are rentals changing with tenure?',
      answer:
        'Longer rental tenures offer better monthly rates because the total cost is spread over a longer period, reducing the per-month expense for you.',
    },
    {
      question: 'How many port does the server comprise of?',
      answer:
        'The number of ports varies by server model. Please check the individual product specifications page for detailed port information.',
    },
    {
      question:
        'When does the product need to be serviced? Will servicing be charged additionally?',
      answer:
        'Products are serviced as per the schedule defined in your rental agreement. Servicing is included in your rental plan at no additional cost.',
    },
    {
      question: 'Is the RAM build in?',
      answer:
        'RAM specifications depend on the product configuration you choose. All details are listed on each product page.',
    },
  ],
  Subscription: [
    {
      question: 'Can I change my subscription plan mid-tenure?',
      answer:
        'Yes, you can upgrade your plan at any time. Downgrades are processed at the end of your current billing cycle.',
    },
    {
      question: 'What happens at the end of my rental period?',
      answer:
        'You can choose to renew, upgrade to newer equipment, or return the products. We handle all logistics for returns.',
    },
  ],
  'Delivery and Installation': [
    {
      question: 'How long does delivery take?',
      answer:
        'Standard delivery takes 3-5 business days across India. Express delivery options are available in metro cities.',
    },
    {
      question: 'Is installation included?',
      answer:
        'Yes, professional installation and setup is included with all server and enterprise equipment rentals.',
    },
  ],
  'Service and Maintainence': [
    {
      question: 'What does the service warranty cover?',
      answer:
        'Our warranty covers all hardware defects, component failures, and performance issues. Accidental damage may have additional charges.',
    },
    {
      question: 'How quickly can I get a replacement?',
      answer:
        'We provide next-business-day replacements in metro cities and 2-3 business days in other locations.',
    },
  ],
}

/* ───────────────── Components ───────────────── */

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="py-5 border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left group"
      >
        <span
          className={`text-sm font-medium transition-colors ${
            isOpen
              ? 'text-[#6d5ed6]'
              : 'text-[#17113e] group-hover:text-[#6d5ed6]'
          }`}
        >
          {question}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 ml-6 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="mt-3 text-[#828282] text-sm leading-relaxed pr-0 sm:pr-8">
          {answer}
        </div>
      )}
    </div>
  )
}

/* ───────────────── Page ───────────────── */

export default function AboutPage() {
  const [showAllBenefits, setShowAllBenefits] = useState(false)
  const [activeFaqCategory, setActiveFaqCategory] = useState(
    'Signing Up with us'
  )
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  const currentFaqs = faqs[activeFaqCategory] || []

  return (
    <div className="font-['Poppins',sans-serif]">
      {/* ── 1. Dark Hero Section ── */}
      <section className="relative bg-gradient-to-b from-[#1a1250] via-[#17113e] to-[#17113e] py-16 md:py-24 overflow-hidden">
        <div className="section-container text-center">
          <h1 className="font-['Space_Grotesk',sans-serif] text-[28px] sm:text-[40px] md:text-[52px] lg:text-[65px] font-bold text-white leading-tight">
            Rent assets seamlessly
          </h1>
          <p className="mt-5 text-sm text-white/80 leading-relaxed max-w-[780px] mx-auto">
            Rentr is committed to serve all your IT needs. We are an end-to-end
            renting &amp; leasing solution provider for laptops, desktops,
            workstations and other enterprise products.
          </p>
          <button className="mt-8 inline-flex items-center gap-2 bg-[#6d5ed6] hover:bg-[#5c4fc4] text-white text-sm font-medium px-7 py-3 rounded-full shadow-lg shadow-[#6d5ed6]/30 transition-colors">
            <Play size={16} fill="white" />
            Watch the film
          </button>

          {/* Video thumbnail placeholder */}
          <div className="mt-10 max-w-[860px] mx-auto">
            <div className="relative aspect-video bg-[#1e1754] rounded-xl overflow-hidden border border-white/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                  <Play
                    size={28}
                    className="text-white ml-1"
                    fill="white"
                  />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Cost & Worry Saving Tagline ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="section-container text-center">
          <h2 className="font-['Space_Grotesk',sans-serif] text-[28px] sm:text-[36px] md:text-[49px] font-bold text-[#130c3d] leading-tight max-w-[1086px] mx-auto">
            Rentr is a cost and worry saving solution for all the everyday
            headaches of IT
          </h2>
          <p className="mt-6 text-base text-[#4f4f4f] leading-relaxed max-w-[972px] mx-auto">
            Monitoring, maintaining, upgrading, and moving. It helps manage,
            visualize and automate the entire process of leasing &amp; renting IT
            infrastructure. Our software platform makes it easy to configure,
            purchase, finance, track and service assets in a fraction of the time
            typically required.
          </p>
        </div>
      </section>

      {/* ── 3. Benefits of Renting/Leasing Section ── */}
      <section className="relative py-16 md:py-24 bg-[#17113e] overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1754]/50 via-transparent to-[#130c3d]/50 pointer-events-none" />
        <div className="relative z-10 section-container">
          <div className="text-center mb-12">
            <h2 className="font-['Space_Grotesk',sans-serif] text-[28px] sm:text-[36px] md:text-[45px] font-bold text-white leading-tight">
              Benefits of renting/leasing with{' '}
              <span className="bg-gradient-to-r from-[#f97316] to-[#ef4444] bg-clip-text text-transparent">
                Rentr
              </span>
            </h2>
            <p className="mt-4 text-sm text-white/65 max-w-[700px] mx-auto leading-relaxed">
              Discover why businesses across India trust Rentr for their IT
              infrastructure needs.
            </p>
          </div>

          {/* Benefit cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(showAllBenefits ? benefitCards : benefitCards.slice(0, 3)).map(
              (card, i) => {
                const Icon = card.icon
                return (
                  <div
                    key={i}
                    className="bg-[rgba(212,208,247,0.11)] rounded-xl p-8 flex flex-col h-auto md:min-h-[383px]"
                  >
                    {/* Icon area */}
                    <div className="w-full h-[100px] md:h-[160px] rounded-lg mb-4 md:mb-6 flex items-center justify-center">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${card.color}25` }}
                      >
                        <Icon size={36} style={{ color: card.color }} />
                      </div>
                    </div>
                    <h3 className="font-['Space_Grotesk',sans-serif] text-2xl font-bold text-white mb-3">
                      {card.title}
                    </h3>
                    <p className="text-xs text-white/80 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                )
              }
            )}
          </div>

          {/* See all benefits toggle */}
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAllBenefits((prev) => !prev)}
              className="inline-flex items-center gap-2 bg-[#6d5ed6] hover:bg-[#5c4fc4] text-white text-sm font-medium px-7 py-3 rounded-full transition-colors"
            >
              {showAllBenefits ? 'See less' : 'See all 9 benefits >'}
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. Customer Testimonials ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="section-container">
          <h2 className="font-['Space_Grotesk',sans-serif] text-lg font-semibold text-[#333] text-center mb-10">
            Our customers love our product
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="border border-[#f2f2f2] rounded-lg shadow-sm p-6 flex flex-col items-center text-center"
              >
                {/* Avatar */}
                <img
                  src={avatarImages[i % avatarImages.length]}
                  alt={t.name}
                  className="w-[63px] h-[63px] rounded-full object-cover mb-4"
                  onError={handleImgError}
                  loading="lazy"
                />
                <h3 className="font-['Space_Grotesk',sans-serif] text-xl font-bold text-[#333]">
                  {t.name}
                </h3>
                <p className="text-xs text-[#c4c4c4] mt-1">{t.company}</p>
                <p className="text-xs text-[#4f4f4f] leading-relaxed mt-4 max-w-full sm:max-w-[281px]">
                  {t.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FAQ Section ── */}
      <section className="py-14 md:py-20 bg-white">
        <div className="section-container max-w-4xl">
          <h2 className="font-['Space_Grotesk',sans-serif] text-[22px] font-bold text-[#17113e] mb-8">
            Frequently Asked Questions (FAQ's)
          </h2>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-10">
            {faqCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveFaqCategory(cat)
                  setOpenFaqIndex(-1)
                }}
                className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-medium transition-all border ${
                  activeFaqCategory === cat
                    ? 'bg-[#3b3b3b] text-white border-[#3b3b3b]'
                    : 'bg-white text-[#4f4f4f] border-gray-200 hover:border-gray-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ accordion */}
          <div className="divide-y divide-gray-100">
            {currentFaqs.map((faq, i) => (
              <FAQItem
                key={`${activeFaqCategory}-${i}`}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaqIndex === i}
                onToggle={() =>
                  setOpenFaqIndex(openFaqIndex === i ? -1 : i)
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CTA Banner ── */}
      <section className="relative py-14 md:py-20 overflow-hidden">
        {/* Colorful mesh gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0edff] via-[#fef3e2] to-[#fce7f3]" />
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#6d5ed6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[#f97316]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 section-container text-center">
          {/* Limited offer badge */}
          <span className="inline-block bg-gradient-to-r from-[#f97316] to-[#ef4444] text-white text-[11px] font-bold uppercase tracking-wider px-5 py-1.5 rounded-full mb-6">
            Limited offer
          </span>

          <h2 className="font-['Space_Grotesk',sans-serif] text-[22px] sm:text-[28px] md:text-[32px] font-bold text-[#17113e] leading-tight max-w-2xl mx-auto">
            Upto 6000 off on 90% products for renting today!
          </h2>

          <Link
            to="/search"
            className="inline-flex items-center gap-2 mt-8 px-8 py-3 rounded-full text-sm font-medium transition-all border border-[#6d5ed6]/30 bg-gradient-to-r from-[#2a2354] to-[#100a33] hover:from-[#342d66] hover:to-[#1a1244]"
          >
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#c084fc] bg-clip-text text-transparent">
              Get quote now
            </span>
          </Link>
        </div>
      </section>
    </div>
  )
}
