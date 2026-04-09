import { useRef, useEffect } from 'react'
import { X, Search, Plus, Minus, AlertCircle } from 'lucide-react'
import CategoryIcon from './CategoryIcon'

export default function ComponentSelectionModal({
  modalCategory,
  modalSearch,
  setModalSearch,
  tempSelections,
  updateTempQty,
  tempTotalQty,
  isMaxReached,
  filteredOptions,
  onDone,
  onCancel,
}) {
  const modalRef = useRef(null)
  const searchInputRef = useRef(null)

  // Focus search on modal open
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Close modal on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onCancel()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <CategoryIcon type={modalCategory.icon} size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-dark text-base">{modalCategory.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {tempTotalQty} of {modalCategory.maxQty}, Max {modalCategory.maxQty}
                </span>
                {isMaxReached && (
                  <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
                    <AlertCircle size={12} />
                    Max limit reached
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-6 py-3 border-b border-gray-50 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search components..."
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
            />
            {modalSearch && (
              <button
                onClick={() => setModalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Options list */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
          {filteredOptions.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              No components found matching &ldquo;{modalSearch}&rdquo;
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const qty = tempSelections[opt.id] || 0
              const isSelected = qty > 0

              return (
                <div
                  key={opt.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Option name & SKU */}
                  <p className="text-sm text-dark font-medium leading-snug mb-1">{opt.name}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">SKU: {opt.sku}</span>
                      <span className="text-sm text-primary font-semibold">
                        {opt.price === 0 ? 'Included' : `+₹${opt.price.toLocaleString()}/mo`}
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateTempQty(opt.id, -1)}
                        disabled={qty === 0}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          qty === 0
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-dark">{qty}</span>
                      <button
                        onClick={() => updateTempQty(opt.id, 1)}
                        disabled={isMaxReached && !isSelected}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isMaxReached && !isSelected
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                        }`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between shrink-0">
          <div className="text-sm text-gray-500">
            <span className="font-semibold text-dark">{tempTotalQty}</span> of {modalCategory.maxQty} selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="btn-outline px-6 py-2 text-sm rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={onDone}
              className="btn-primary px-6 py-2 text-sm rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
