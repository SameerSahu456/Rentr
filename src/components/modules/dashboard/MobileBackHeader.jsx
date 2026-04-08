import { ChevronLeft, ChevronRight } from 'lucide-react'

// ─── Mobile Back Header ───
// Used by both dashboards. variant controls icon/behavior differences.
// variant: 'customer' | 'distributor'

export default function MobileBackHeader({ title, onBack, variant = 'customer' }) {
  if (variant === 'distributor') {
    return (
      <div className="lg:hidden bg-dark text-white flex items-center gap-3 px-4 py-3.5 -mx-4 sm:-mx-6 md:-mx-10 -mt-4 sm:-mt-6 mb-6">
        <button onClick={onBack} className="text-white hover:text-gray-300">
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <span className="font-heading font-semibold text-sm">{title}</span>
      </div>
    )
  }

  // Customer variant
  return (
    <div className="lg:hidden bg-dark text-white flex items-center gap-3 px-4 py-3.5 -mx-4 sm:-mx-6 -mt-6 mb-6">
      <button onClick={onBack} className="text-white cursor-pointer">
        <ChevronLeft size={20} />
      </button>
      <span className="font-heading font-medium text-sm">{title}</span>
    </div>
  )
}
