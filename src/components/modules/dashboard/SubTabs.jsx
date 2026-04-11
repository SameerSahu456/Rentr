// ─── SubTabs ───
// Used by both dashboards. variant controls styling differences.
// variant: 'customer' | 'distributor'

export default function SubTabs({ tabs, active, onChange, variant = 'customer' }) {
  if (variant === 'distributor') {
    return (
      <div className="flex border-b border-gray-300 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`px-5 py-3 text-xs font-semibold tracking-wide uppercase transition-colors font-heading whitespace-nowrap shrink-0 ${
              active === t.key
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-3 hover:text-gray-2'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    )
  }

  // Customer variant
  return (
    <div className="flex gap-4 sm:gap-6 border-b border-gray-300 mb-6 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`pb-2 text-xs font-semibold tracking-wide uppercase transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            active === t.key
              ? 'text-gray-1 border-b-2 border-gray-1'
              : 'text-gray-3 hover:text-gray-2'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
