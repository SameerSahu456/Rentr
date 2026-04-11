import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MOCK_CATEGORIES, MOCK_BRANDS } from '../../../constants/search'

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-bold text-dark uppercase tracking-wide mb-3 cursor-pointer"
      >
        {title}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && children}
    </div>
  )
}

function CheckboxFilter({ items, selected, onToggle, searchable = false }) {
  const [searchTerm, setSearchTerm] = useState('')
  const filtered = searchable && searchTerm
    ? items.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
    : items

  return (
    <div>
      {searchable && (
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-xs focus:outline-none focus:border-primary"
          />
          <Search size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      )}
      <div className="space-y-2">
        {filtered.map((item) => (
          <label key={item} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={() => onToggle(item)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
            />
            <span className="text-xs text-gray-600 group-hover:text-primary transition-colors">
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default function SearchFilterSidebar({
  showMobileFilters,
  onCloseMobile,
  expandedCategory,
  onExpandCategory,
  selectedBrands = [],
  onToggleBrand,
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceChange,
}) {
  const [categories] = useState(MOCK_CATEGORIES)
  const [brands] = useState(MOCK_BRANDS)

  return (
    <aside className={`${showMobileFilters ? 'fixed inset-0 z-40 bg-white overflow-y-auto p-4 lg:static lg:z-auto lg:bg-transparent lg:p-0' : 'hidden'} lg:block w-full lg:w-56 shrink-0`}>
      {/* Product Categories */}
      <FilterSection title="Product Categories">
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory?.('')}
            className={`w-full text-left text-sm py-1.5 hover:text-primary cursor-pointer ${
              !selectedCategory ? 'font-semibold text-dark' : 'text-gray-700'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <div key={cat.id}>
              <button
                onClick={() => {
                  onSelectCategory?.(cat.name)
                  onExpandCategory(expandedCategory === cat.name ? '' : cat.name)
                }}
                className="w-full flex items-center justify-between text-sm text-gray-700 py-1.5 hover:text-primary cursor-pointer"
              >
                <span className={selectedCategory === cat.name || expandedCategory === cat.name ? 'font-semibold text-dark' : ''}>
                  {cat.name}
                </span>
                {cat.children && cat.children.length > 0 && (
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${expandedCategory === cat.name ? 'rotate-180' : ''}`}
                  />
                )}
              </button>
              {expandedCategory === cat.name && cat.children && cat.children.length > 0 && (
                <div className="ml-3 mt-1 space-y-1">
                  {cat.children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => onSelectCategory?.(child.name)}
                      className={`block text-xs py-1 transition-colors cursor-pointer ${
                        selectedCategory === child.name ? 'text-primary font-medium' : 'text-gray-500 hover:text-primary'
                      }`}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Filter by Price */}
      <FilterSection title="Filter by Price">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <input
            type="number"
            placeholder="Min"
            value={priceRange?.[0] || ''}
            onChange={(e) => onPriceChange?.([e.target.value ? Number(e.target.value) : '', priceRange?.[1] || ''])}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
          />
          <span>—</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange?.[1] || ''}
            onChange={(e) => onPriceChange?.([priceRange?.[0] || '', e.target.value ? Number(e.target.value) : ''])}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
          />
        </div>
      </FilterSection>

      <FilterSection title="Filter by Brand">
        <CheckboxFilter
          items={brands}
          selected={selectedBrands}
          onToggle={onToggleBrand}
          searchable
        />
      </FilterSection>

      {/* Mobile close */}
      <button
        onClick={onCloseMobile}
        className="lg:hidden w-full btn-primary text-sm py-2.5 mt-4"
      >
        Apply Filters
      </button>
    </aside>
  )
}
