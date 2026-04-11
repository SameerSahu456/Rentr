import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight, ChevronDown, Settings, Check,
  ShoppingCart, Trash2, Info, Server, Monitor, Laptop, PcCase
} from 'lucide-react'
import { PRODUCT_TYPES, COMPONENT_CATEGORIES } from '../../constants/buildYourOwn'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import CategoryIcon from '../../components/modules/build-your-own/CategoryIcon'
import ComponentSelectionModal from '../../components/modules/build-your-own/ComponentSelectionModal'

const TENURE_OPTIONS = [3, 6, 12, 24, 36]

const TYPE_ICONS = {
  'tower-server': Server,
  'rack-server': Server,
  'workstation': PcCase,
  'laptop': Laptop,
  'desktop': Monitor,
}

export default function BuildYourOwn() {
  const { user } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()

  // Selected product type
  const [selectedType, setSelectedType] = useState(PRODUCT_TYPES[0].id)

  // selections: { [categoryId]: { [optionId]: quantity } }
  const [selections, setSelections] = useState({})
  const [tenure, setTenure] = useState(12)
  const [adding, setAdding] = useState(false)

  // Which category's modal is currently open (null = none)
  const [openModal, setOpenModal] = useState(null)

  // Search query within modal
  const [modalSearch, setModalSearch] = useState('')

  // Temp selections while modal is open (commit on "Done")
  const [tempSelections, setTempSelections] = useState({})

  /* ─── Derived data ─── */

  const activeProductType = PRODUCT_TYPES.find((t) => t.id === selectedType)
  const activeCategories = activeProductType
    ? activeProductType.categories.map((catId) => COMPONENT_CATEGORIES[catId]).filter(Boolean)
    : []

  /* ─── Helpers ─── */

  function handleTypeChange(typeId) {
    if (typeId === selectedType) return
    setSelectedType(typeId)
    setSelections({})
    setOpenModal(null)
  }

  function getCategorySelections(categoryId) {
    return selections[categoryId] || {}
  }

  function getCategoryTotalQty(categoryId, source) {
    const sel = source || getCategorySelections(categoryId)
    return Object.values(sel).reduce((sum, qty) => sum + qty, 0)
  }

  function getSelectedItemNames(categoryId) {
    const sel = getCategorySelections(categoryId)
    const cat = COMPONENT_CATEGORIES[categoryId]
    if (!cat) return []
    return Object.entries(sel)
      .filter(([, qty]) => qty > 0)
      .map(([optId, qty]) => {
        const opt = cat.options.find((o) => o.id === optId)
        return { name: opt?.name || '', qty, price: opt?.price || 0 }
      })
  }

  function openCategoryModal(categoryId) {
    setOpenModal(categoryId)
    setModalSearch('')
    setTempSelections({ ...getCategorySelections(categoryId) })
  }

  function updateTempQty(optionId, delta) {
    setTempSelections((prev) => {
      const current = prev[optionId] || 0
      const newQty = Math.max(0, current + delta)
      const cat = COMPONENT_CATEGORIES[openModal]
      if (!cat) return prev

      const totalWithout = Object.entries(prev)
        .filter(([id]) => id !== optionId)
        .reduce((sum, [, q]) => sum + q, 0)
      if (totalWithout + newQty > cat.maxQty) return prev

      const next = { ...prev, [optionId]: newQty }
      if (next[optionId] === 0) delete next[optionId]
      return next
    })
  }

  const handleModalDone = useCallback(() => {
    setSelections((prev) => ({
      ...prev,
      [openModal]: { ...tempSelections },
    }))
    setOpenModal(null)
    setModalSearch('')
  }, [openModal, tempSelections])

  const handleModalCancel = useCallback(() => {
    setOpenModal(null)
    setModalSearch('')
  }, [])

  /* ─── Price calculation ─── */

  function calculateTotalMonthly() {
    let total = activeProductType?.basePrice || 0
    for (const cat of activeCategories) {
      const sel = selections[cat.id] || {}
      for (const [optId, qty] of Object.entries(sel)) {
        const opt = cat.options.find((o) => o.id === optId)
        if (opt) total += opt.price * qty
      }
    }
    return total
  }

  const totalMonthly = calculateTotalMonthly()
  const totalContract = totalMonthly * tenure

  /* Count total selected items */
  const totalSelectedItems = activeCategories.reduce(
    (sum, cat) => sum + getCategoryTotalQty(cat.id),
    0
  )

  /* ─── Add to Cart ─── */

  async function handleAddToCart() {
    if (!user) {
      navigate('/login')
      return
    }
    if (totalSelectedItems === 0) return
    setAdding(true)
    try {
      await addItem(1, 1, tenure)
      navigate('/checkout')
    } catch {
      // ignore
    } finally {
      setAdding(false)
    }
  }

  /* ─── Modal-specific data ─── */
  const modalCategory = openModal ? COMPONENT_CATEGORIES[openModal] : null
  const filteredOptions = modalCategory
    ? modalCategory.options.filter((opt) =>
        opt.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
        opt.sku.toLowerCase().includes(modalSearch.toLowerCase())
      )
    : []
  const tempTotalQty = openModal ? getCategoryTotalQty(openModal, tempSelections) : 0
  const isMaxReached = modalCategory ? tempTotalQty >= modalCategory.maxQty : false

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ═══════ BREADCRUMB ═══════ */}
      <div className="border-b border-gray-300 bg-white">
        <div className="section-container py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/search" className="hover:text-primary transition-colors">Products</Link>
          <ChevronRight size={14} />
          <span className="text-dark font-semibold">Build Your Own</span>
        </div>
      </div>

      <div className="section-container py-8 md:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-dark mb-2">
            Build Your Own
          </h1>
          <p className="text-gray-500 max-w-xl">
            Choose your device type and customize every component. Pricing updates in real-time based on your selections.
          </p>
        </div>

        {/* ═══════ PRODUCT TYPE SELECTOR ═══════ */}
        <div className="mb-8">
          <h2 className="font-heading text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            What do you want to build?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PRODUCT_TYPES.map((type) => {
              const isActive = selectedType === type.id
              const Icon = TYPE_ICONS[type.id] || Server
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.id)}
                  className={`relative group text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    isActive ? 'bg-primary/15' : 'bg-gray-50 group-hover:bg-gray-100'
                  }`}>
                    <Icon size={20} className={isActive ? 'text-primary' : 'text-gray-400'} />
                  </div>
                  <h3 className={`font-heading font-bold text-sm mb-0.5 ${
                    isActive ? 'text-dark' : 'text-gray-700'
                  }`}>
                    {type.label}
                  </h3>
                  <p className="text-xs text-gray-400 leading-snug">{type.description}</p>
                  <p className={`text-xs font-semibold mt-2 ${
                    isActive ? 'text-primary' : 'text-gray-400'
                  }`}>
                    From ₹{type.basePrice.toLocaleString('en-IN')}/mo
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Configure your {activeProductType?.label}
          </span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ─── LEFT: CONFIGURATION SECTIONS ─── */}
          <div className="lg:col-span-2 space-y-4">
            {activeCategories.map((cat) => {
              const catTotalQty = getCategoryTotalQty(cat.id)
              const selectedItems = getSelectedItemNames(cat.id)
              const hasSelections = selectedItems.length > 0
              const categoryPrice = selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0)

              return (
                <div
                  key={cat.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-shadow hover:shadow-sm"
                >
                  {/* Category header */}
                  <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CategoryIcon type={cat.icon} size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-dark text-base">{cat.title}</h3>
                        <p className="text-xs text-gray-400">
                          {catTotalQty} of {cat.maxQty} selected
                          {categoryPrice > 0 && (
                            <span className="text-primary font-medium ml-2">
                              +₹{categoryPrice.toLocaleString('en-IN')}/mo
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => openCategoryModal(cat.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      <Settings size={14} />
                      {hasSelections ? 'Change' : 'Select'}
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  {/* Selected items preview */}
                  {hasSelections && (
                    <div className="px-5 pb-4 space-y-2">
                      {selectedItems.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Check size={14} className="text-green-500 shrink-0" />
                            <span className="text-sm text-dark truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            {item.price > 0 && (
                              <span className="text-xs text-primary font-medium">
                                ₹{(item.price * item.qty).toLocaleString('en-IN')}/mo
                              </span>
                            )}
                            <span className="text-xs text-gray-500 font-medium">
                              x{item.qty}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* ─── RIGHT: ORDER SUMMARY SIDEBAR ─── */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                {(() => {
                  const Icon = TYPE_ICONS[selectedType] || Server
                  return (
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon size={18} className="text-primary" />
                    </div>
                  )
                })()}
                <div>
                  <h3 className="font-heading font-bold text-dark text-base">{activeProductType?.label}</h3>
                  <p className="text-xs text-gray-400">
                    {totalSelectedItems} component{totalSelectedItems !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-3 text-sm mb-5 max-h-[280px] overflow-y-auto pr-1">
                {/* Base price */}
                <div className="flex items-center justify-between text-gray-500">
                  <span>Base Configuration</span>
                  <span className="font-medium text-dark">₹{(activeProductType?.basePrice || 0).toLocaleString('en-IN')}/mo</span>
                </div>

                {activeCategories.map((cat) => {
                  const sel = selections[cat.id] || {}
                  const entries = Object.entries(sel).filter(([, qty]) => qty > 0)
                  if (entries.length === 0) return null

                  return entries.map(([optId, qty]) => {
                    const opt = cat.options.find((o) => o.id === optId)
                    if (!opt || opt.price === 0) return null
                    return (
                      <div key={optId} className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-dark truncate">{opt.name.split('(')[0].trim()}</p>
                          <p className="text-xs text-gray-400">x{qty}</p>
                        </div>
                        <span className="font-medium text-dark shrink-0">
                          ₹{(opt.price * qty).toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                    )
                  })
                })}
              </div>

              <hr className="border-gray-200 mb-4" />

              {/* Tenure selection */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Rental Tenure</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {TENURE_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTenure(t)}
                      className={`py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        tenure === t
                          ? 'bg-primary text-white'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {t} mo
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 mb-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-gray-600 font-medium">Monthly Rent</span>
                  <div className="text-right">
                    <span className="text-2xl font-heading font-bold text-dark">
                      ₹{totalMonthly.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm text-gray-500 font-normal">/mo</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-5 px-1">
                <span>Total for {tenure} months</span>
                <span className="font-semibold text-dark">₹{totalContract.toLocaleString('en-IN')}</span>
              </div>

              <p className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                <Info size={12} /> Prices are exclusive of GST (18%)
              </p>

              {/* Actions */}
              <button
                onClick={handleAddToCart}
                disabled={adding || totalSelectedItems === 0}
                className="btn-primary w-full flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} />
                {adding ? 'Adding...' : 'Add to Cart & Checkout'}
              </button>

              <button
                onClick={() => setSelections({})}
                disabled={totalSelectedItems === 0}
                className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors py-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 size={14} />
                Reset Configuration
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ SELECTION MODAL ═══════ */}
      {openModal && modalCategory && (
        <ComponentSelectionModal
          modalCategory={modalCategory}
          modalSearch={modalSearch}
          setModalSearch={setModalSearch}
          tempSelections={tempSelections}
          updateTempQty={updateTempQty}
          tempTotalQty={tempTotalQty}
          isMaxReached={isMaxReached}
          filteredOptions={filteredOptions}
          onDone={handleModalDone}
          onCancel={handleModalCancel}
        />
      )}
    </div>
  )
}
