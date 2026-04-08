export default function Tabs({
  tabs,
  active,
  onChange,
  variant = 'default',
  className = '',
  tabClassName = '',
}) {
  if (variant === 'pill') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {tabs.map((tab) => {
          const key = typeof tab === 'string' ? tab : tab.key
          const label = typeof tab === 'string' ? tab : tab.label
          const icon = typeof tab === 'object' ? tab.icon : null
          const isActive = active === key

          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium font-body transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#6d5ed6] text-white'
                  : 'bg-[#f2f2f2] text-[#828282] hover:bg-[#e5e5e5]'
              } ${tabClassName}`}
            >
              {icon && <span className="mr-1.5">{icon}</span>}
              {label}
            </button>
          )
        })}
      </div>
    )
  }

  if (variant === 'underline') {
    return (
      <div className={`flex border-b border-[#e0e0e0] ${className}`}>
        {tabs.map((tab) => {
          const key = typeof tab === 'string' ? tab : tab.key
          const label = typeof tab === 'string' ? tab : tab.label
          const icon = typeof tab === 'object' ? tab.icon : null
          const isActive = active === key

          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`px-4 py-3 text-sm font-medium font-body transition-colors cursor-pointer border-b-2 -mb-px ${
                isActive
                  ? 'text-[#6d5ed6] border-[#6d5ed6]'
                  : 'text-[#828282] border-transparent hover:text-[#4f4f4f]'
              } ${tabClassName}`}
            >
              {icon && <span className="mr-1.5">{icon}</span>}
              {label}
            </button>
          )
        })}
      </div>
    )
  }

  // default variant - button group
  return (
    <div className={`flex gap-2 ${className}`}>
      {tabs.map((tab) => {
        const key = typeof tab === 'string' ? tab : tab.key
        const label = typeof tab === 'string' ? tab : tab.label
        const count = typeof tab === 'object' ? tab.count : null
        const icon = typeof tab === 'object' ? tab.icon : null
        const isActive = active === key

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`px-4 py-2 text-sm font-medium font-body transition-colors cursor-pointer rounded-lg ${
              isActive
                ? 'bg-[#6d5ed6] text-white'
                : 'text-[#828282] hover:text-[#4f4f4f] hover:bg-[#f2f2f2]'
            } ${tabClassName}`}
          >
            {icon && <span className="mr-1.5">{icon}</span>}
            {label}
            {count != null && (
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20' : 'bg-[#f2f2f2]'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
