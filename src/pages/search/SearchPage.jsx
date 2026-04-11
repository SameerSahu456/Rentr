import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useParams, Link } from 'react-router-dom'
import { handleImgError } from '../../constants/images'
import {
  Grid3X3, List, ChevronDown, ChevronRight, ChevronLeft, SlidersHorizontal,
} from 'lucide-react'
import { SORT_OPTIONS, BANNER_SLIDES, SUB_NAV_TABS } from '../../constants/search'
import { saleorProducts } from '../../services/saleor'
import SearchFilterSidebar from '../../components/modules/search/SearchFilterSidebar'
import { SearchProductCardGrid, SearchProductCardList } from '../../components/modules/search/SearchProductCard'
import ContactForm from '../../components/modules/search/ContactForm'

const PAGE_SIZE = 16

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const { category: urlCategory } = useParams()
  const query = searchParams.get('q') || ''
  const isSearchMode = !!query

  /* carousel state */
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % BANNER_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToSlide = useCallback(idx => setActiveSlide(idx), [])

  /* view / sort */
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('default')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  /* active sub-nav tab */
  const [activeTab, setActiveTab] = useState(
    urlCategory
      ? SUB_NAV_TABS.find(t => t.toLowerCase() === urlCategory.toLowerCase()) || SUB_NAV_TABS[0]
      : SUB_NAV_TABS[0]
  )

  /* sidebar filter state */
  const [expandedCategory, setExpandedCategory] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || '')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [priceRange, setPriceRange] = useState(['', ''])

  /* pagination */
  const [currentPage, setCurrentPage] = useState(1)

  /* API data */
  const [products, setProducts] = useState([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  /* Fetch products from Saleor */
  useEffect(() => {
    setLoading(true)
    saleorProducts.list({
      search: query || undefined,
      category: selectedCategory || undefined,
      brands: selectedBrands.length > 0 ? selectedBrands : undefined,
      priceMin: priceRange[0] || undefined,
      priceMax: priceRange[1] || undefined,
      sortBy,
      page: currentPage,
      pageSize: PAGE_SIZE,
    }).then(result => {
      setProducts(result.products)
      setTotalProducts(result.totalCount)
      setTotalPages(result.totalPages)
    }).catch(err => {
      console.error('[Saleor] Failed to fetch products:', err)
      setProducts([])
      setTotalProducts(0)
      setTotalPages(0)
    }).finally(() => setLoading(false))
  }, [query, currentPage, sortBy, selectedCategory, selectedBrands, priceRange])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [query, sortBy, selectedCategory, selectedBrands, priceRange])

  // Update category when URL changes
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory)
    }
  }, [urlCategory])

  const handleToggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    )
  }

  /* breadcrumb */
  const breadcrumbParts = ['Home', 'Products']
  if (selectedCategory) {
    breadcrumbParts.push(selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1))
  }
  if (query) {
    breadcrumbParts.push(query)
  }

  /* page numbers */
  const pageNumbers = []
  const maxVisible = 10
  const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  const endPage = Math.min(totalPages, startPage + maxVisible - 1)
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  /* grid columns */
  const gridCols = viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb + Sub-nav */}
      <div className="bg-white border-b border-gray-300">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
              {breadcrumbParts.map((crumb, i) => (
                <span key={i} className="flex items-center gap-2 shrink-0">
                  {i > 0 && <ChevronRight size={14} className="text-gray-400" />}
                  {i === 0 ? (
                    <Link to="/" className="hover:text-primary transition-colors">{crumb}</Link>
                  ) : i === breadcrumbParts.length - 1 ? (
                    <span className="text-dark font-semibold">{crumb}</span>
                  ) : (
                    <Link to={`/products/${crumb.toLowerCase()}`} className="hover:text-primary transition-colors">
                      {crumb}
                    </Link>
                  )}
                </span>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-6">
              {SUB_NAV_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    if (tab === 'Featured products') {
                      setSelectedCategory('')
                    } else {
                      setSelectedCategory(tab)
                    }
                  }}
                  className={`text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-dark'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      {!isSearchMode && (
        <div className="section-container mt-5">
          <div className="relative rounded-xl overflow-hidden h-48 md:h-56">
            {BANNER_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img src={slide.image} alt={slide.heading} className="w-full h-full object-cover" onError={handleImgError} loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-r from-dark-bg/80 via-dark-bg/40 to-transparent" />
                <div className="absolute inset-0 flex items-center z-20">
                  <div className="px-8 md:px-12 max-w-lg">
                    <span className="inline-block bg-accent-orange text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {slide.tag}
                    </span>
                    <h2 className="font-heading text-xl md:text-2xl font-bold text-white leading-tight whitespace-pre-line">
                      {slide.heading}
                    </h2>
                    <p className="text-gray-300 text-sm mt-2">{slide.subtext}</p>
                  </div>
                </div>
              </div>
            ))}
            {BANNER_SLIDES.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {BANNER_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`rounded-full transition-all ${
                      idx === activeSlide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="section-container mt-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-sm text-gray-600">
            {loading ? 'Loading...' : isSearchMode ? `Search Results for "${query}"` : <><strong>{totalProducts}</strong> Products found</>}
          </h3>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 cursor-pointer"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

            <div className="hidden md:flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List size={16} />
              </button>
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 bg-white hover:border-primary transition-colors cursor-pointer"
              >
                Sort by: {SORT_OPTIONS.find(o => o.value === sortBy)?.label.replace('Sort by ', '') || 'Default'}
                <ChevronDown size={14} />
              </button>
              {showSortDropdown && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowSortDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg py-2 w-56 z-30">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setShowSortDropdown(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                          sortBy === opt.value ? 'text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content: sidebar + grid */}
      <div className="section-container py-5">
        <div className="flex gap-6">
          <SearchFilterSidebar
            showMobileFilters={showMobileFilters}
            onCloseMobile={() => setShowMobileFilters(false)}
            expandedCategory={expandedCategory}
            onExpandCategory={setExpandedCategory}
            selectedBrands={selectedBrands}
            onToggleBrand={handleToggleBrand}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
          />

          {/* Products */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-gray-400 text-sm">Loading products...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-gray-400 text-sm">No products found. Try adjusting your filters.</div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className={`grid gap-4 ${gridCols}`}>
                {products.map(product => (
                  <SearchProductCardGrid key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div>
                {products.map(product => (
                  <SearchProductCardList key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 flex-wrap gap-4">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>

                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>

                  {pageNumbers.slice(0, typeof window !== 'undefined' && window.innerWidth < 640 ? 5 : 10).map(p => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        p === currentPage
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  {endPage < totalPages && (
                    <span className="text-gray-400 px-1">...</span>
                  )}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <ContactForm />
    </div>
  )
}
