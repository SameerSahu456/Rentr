import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'

export function FilterSection({
  title,
  children,
  defaultOpen = true,
  className = '',
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`border-b border-[#e0e0e0] ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 cursor-pointer"
      >
        <span className="text-sm font-heading font-bold text-[#17113e]">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-[#828282] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  )
}

export function CheckboxFilter({
  items,
  selected = [],
  onChange,
  searchable = false,
  className = '',
}) {
  const [search, setSearch] = useState('')

  const filtered = searchable && search
    ? items.filter((item) => {
        const label = typeof item === 'string' ? item : item.label
        return label.toLowerCase().includes(search.toLowerCase())
      })
    : items

  return (
    <div className={className}>
      {searchable && (
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#828282]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-[#e0e0e0] rounded-lg outline-none focus:border-[#6d5ed6] font-body"
          />
        </div>
      )}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filtered.map((item) => {
          const value = typeof item === 'string' ? item : item.value
          const label = typeof item === 'string' ? item : item.label
          const count = typeof item === 'object' ? item.count : null
          const isChecked = selected.includes(value)

          return (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {
                  const next = isChecked
                    ? selected.filter((s) => s !== value)
                    : [...selected, value]
                  onChange(next)
                }}
                className="w-4 h-4 rounded border-[#e0e0e0] text-[#6d5ed6] focus:ring-[#6d5ed6] cursor-pointer"
              />
              <span className="text-sm font-body text-[#4f4f4f] group-hover:text-[#333]">
                {label}
              </span>
              {count != null && (
                <span className="text-xs text-[#828282] ml-auto">({count})</span>
              )}
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default FilterSection
