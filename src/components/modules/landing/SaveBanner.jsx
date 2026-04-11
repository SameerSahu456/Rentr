import { Link } from 'react-router-dom'

export default function SaveBanner() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Dark gradient background with mesh overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#0f1b3d] to-[#0a2a2a]" />
      <div className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(220, 50, 50, 0.4), transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(0, 180, 180, 0.3), transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(60, 60, 200, 0.3), transparent 50%)',
        }}
      />

      <div className="relative z-10 text-center section-container">
        <h2 className="font-heading text-[22px] sm:text-[28px] md:text-[36px] font-bold text-white leading-tight mb-2">
          Save upto 15%
        </h2>
        <p className="font-heading text-[22px] sm:text-[28px] md:text-[36px] font-bold text-white leading-tight mb-8">
          Design your own rack Infrastructure today
        </p>
        <Link
          to="/build-your-own"
          className="inline-block bg-white hover:bg-gray-100 text-primary px-8 py-3 rounded-full text-sm font-semibold transition-colors"
        >
          Configure now &gt;
        </Link>
      </div>
    </section>
  )
}
