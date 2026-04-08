// ─── Dashboard Sidebar ───
// Used by both CustomerDashboard and DistributorDashboard
// variant: 'customer' | 'distributor'

export default function DashboardSidebar({ items, activeTab, onTabChange, variant = 'customer' }) {
  if (variant === 'distributor') {
    return (
      <aside className="hidden lg:block w-[170px] min-h-screen bg-dark shrink-0 sticky top-0 self-start">
        <div className="py-6">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.key
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 text-[13px] font-medium transition-all relative ${
                  isActive
                    ? 'bg-primary/20 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r" />
                )}
                <Icon size={16} />
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </div>
      </aside>
    )
  }

  // Customer variant
  return (
    <aside className="w-[255px] bg-white min-h-screen shrink-0">
      <nav className="pt-10">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.key
          return (
            <button key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`w-full flex items-center gap-4 px-8 py-4 text-base font-medium transition-all cursor-pointer ${isActive ? 'bg-primary/5 text-dark border-l-[3px] border-dark' : 'text-gray-3 hover:bg-gray-50 border-l-[3px] border-transparent'}`}>
              <Icon size={20} />{item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
