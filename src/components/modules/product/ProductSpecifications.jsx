import { useState } from 'react'
import { ChevronDown, Check, Wrench } from 'lucide-react'
import { handleImgError } from '../../../constants/images'

export default function ProductSpecifications({
  product,
  activeTab,
  setActiveTab,
  serverDetails,
  itemDetails,
  specTable,
  byoExpanded,
  setByoExpanded,
  byoCategories,
  testimonials,
}) {
  return (
    <>
      {/* ═══════ TABS: Product Description | Specifications ═══════ */}
      <div className="mt-8 border-b border-gray-300">
        <div className="flex">
          {[
            { key: 'description', label: 'Product Description' },
            { key: 'specifications', label: 'Specifications' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-dark font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'description' && (
        <div className="py-6">
          {/* Product info with image */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-64 h-48 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              <img src={product.images[1]} alt="" className="w-full h-full object-contain p-4" onError={handleImgError} loading="lazy" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-bold text-lg text-dark">{product.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium">Brands</span> {product.brand}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Product Code:</span> {product.productCode}
              </p>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{product.description}</p>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
                <div>
                  <span className="text-sm font-medium text-dark">Size & Dimensions</span>
                  <p className="text-sm text-gray-500">{product.sizeAndDimensions}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-dark">Features</span>
                  <p className="text-sm text-gray-500">Scalable</p>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-sm font-medium text-dark">Weight</span>
                <p className="text-sm text-gray-500">{product.weight}</p>
              </div>
            </div>
          </div>

          {/* What's new */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-dark">Whats new?</h4>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{product.whatsNew}</p>
          </div>

          {/* Monthly / Total */}
          <div className="flex gap-12 mt-4">
            <div>
              <p className="text-sm text-gray-500">Monthly rental ( Approx)</p>
              <p className="text-sm font-semibold text-dark">₹{product.monthlyRentalApprox?.toLocaleString()} /-</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total (Approx)</p>
              <p className="text-sm font-semibold text-dark">₹{product.totalApprox?.toLocaleString()} /-</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'specifications' && (
        <div className="py-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-64 h-48 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              <img src={product.images[1]} alt="" className="w-full h-full object-contain p-4" onError={handleImgError} loading="lazy" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-bold text-lg text-dark">{product.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium">Brands</span> {product.brand}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Product Code:</span> {product.productCode}
              </p>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{product.description}</p>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
                <div>
                  <span className="text-sm font-medium text-dark">Size & Dimensions</span>
                  <p className="text-sm text-gray-500">{product.sizeAndDimensions}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-dark">Features</span>
                  <p className="text-sm text-gray-500">Scalable</p>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-sm font-medium text-dark">Weight</span>
                <p className="text-sm text-gray-500">{product.weight}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-dark">Whats new?</h4>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{product.whatsNew}</p>
          </div>

          <div className="flex gap-12 mt-4">
            <div>
              <p className="text-sm text-gray-500">Monthly rental ( Approx)</p>
              <p className="text-sm font-semibold text-dark">₹{product.monthlyRentalApprox?.toLocaleString()} /-</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total (Approx)</p>
              <p className="text-sm font-semibold text-dark">₹{product.totalApprox?.toLocaleString()} /-</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ SERVER DETAILS ═══════ */}
      <div className="mt-4">
        <h3 className="font-heading font-bold text-sm text-dark uppercase tracking-wide mb-3">Server Details</h3>
        <div className="border border-gray-300 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full">
            <tbody>
              {serverDetails.map((item, i) => (
                <tr key={i} className="border-b border-gray-200 last:border-b-0">
                  <td className="px-4 py-2.5 text-sm text-gray-500 w-32 sm:w-40">• {item.label}</td>
                  <td className="px-4 py-2.5 text-sm text-dark">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════ ITEM DETAILS ═══════ */}
      {activeTab === 'specifications' && (
        <div className="mt-6">
          <h3 className="font-heading font-bold text-sm text-dark uppercase tracking-wide mb-3">
            {activeTab === 'specifications' ? 'Technical Details' : 'Item Details'}
          </h3>
          <div className="border border-gray-300 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full">
              <tbody>
                {specTable.map((item, i) => (
                  <tr key={i} className="border-b border-gray-200 last:border-b-0">
                    <td className="px-4 py-2.5 text-sm text-gray-500 w-36 sm:w-48">• {item.label}</td>
                    <td className="px-4 py-2.5 text-sm text-dark">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'description' && (
        <div className="mt-6">
          <h3 className="font-heading font-bold text-sm text-dark uppercase tracking-wide mb-3">Item Details</h3>
          <div className="border border-gray-300 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full">
              <tbody>
                {itemDetails.map((item, i) => (
                  <tr key={i} className="border-b border-gray-200 last:border-b-0">
                    <td className="px-4 py-2.5 text-sm text-gray-500 w-32 sm:w-40">• {item.label}</td>
                    <td className="px-4 py-2.5 text-sm text-dark">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════ BUILD YOUR OWN ═══════ */}
      <BuildYourOwnSection
        byoExpanded={byoExpanded}
        setByoExpanded={setByoExpanded}
        byoCategories={byoCategories}
      />

      {/* ═══════ RENTR BENEFITS ═══════ */}
      <div className="mt-10">
        <h2 className="font-heading text-xl font-bold text-dark mb-4">Rentr Benefits</h2>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            Hewlett Packard Enterprise innovation with Intelligent System Tuning optimizes workload
            performance using customized profiles to tune internal resources, with improved
            throughput for all workloads including latency-sensitive workloads such as
            high-frequency trading with jitter smoothing.
          </p>
          <p>
            The HPE ProLiant DL380 Gen10 server supports industry standard technology leveraging
            the latest Intel® Xeon® Processor Scalable Family with up to 28 cores, 12 Gb SAS and 2.0 TB
            2666 MT/s DDR4.
          </p>
          <p>
            The HPE ProLiant DL380 Gen10 server supports up to three double-wide or five single-wide
            GPUs for accelerated workloads.
          </p>
        </div>
      </div>

      {/* ═══════ CUSTOMER TESTIMONIALS ═══════ */}
      <div className="mt-10">
        <h2 className="font-heading text-xl font-bold text-dark mb-6">Our customers love our product</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={handleImgError}
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-semibold text-dark">{t.name}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ─── Inline Build Your Own Component ─── */

function BuildYourOwnSection({ byoExpanded, setByoExpanded, byoCategories }) {
  const [selections, setSelections] = useState({})

  const handleSelect = (categoryId, optionId) => {
    setSelections(prev => ({ ...prev, [categoryId]: optionId }))
  }

  const totalAddon = byoCategories.reduce((sum, cat) => {
    const selectedId = selections[cat.id]
    if (!selectedId) return sum
    const opt = cat.options.find(o => o.id === selectedId)
    return sum + (opt?.price || 0)
  }, 0)

  return (
    <div className="mt-8">
      <button
        onClick={() => setByoExpanded(!byoExpanded)}
        className="w-full flex items-center justify-between bg-gradient-to-r from-primary to-[#5a4bb8] text-white px-6 py-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Wrench size={16} />
          </div>
          <div className="text-left">
            <span className="font-heading font-bold text-sm block">Build Your Own</span>
            <span className="text-xs text-white/70">Customize components to match your needs</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {totalAddon > 0 && (
            <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full">
              +₹{totalAddon.toLocaleString('en-IN')}/mo
            </span>
          )}
          <ChevronDown size={18} className={`transition-transform duration-300 ${byoExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {byoExpanded && (
        <div className="border border-gray-300 border-t-0 rounded-b-xl bg-white overflow-hidden">
          <div className="p-5 space-y-4">
            {byoCategories.map((cat) => {
              const selectedId = selections[cat.id]
              return (
                <div key={cat.id}>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">{cat.label}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {cat.options.map((opt) => {
                      const isSelected = selectedId === opt.id
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(cat.id, opt.id)}
                          className={`relative text-left p-3 rounded-xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                          <p className={`text-xs font-medium leading-tight ${isSelected ? 'text-dark' : 'text-gray-700'}`}>
                            {opt.name}
                          </p>
                          <p className={`text-xs mt-1 font-semibold ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                            {opt.price === 0 ? 'Included' : `+₹${opt.price.toLocaleString('en-IN')}/mo`}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary footer */}
          {totalAddon > 0 && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Add-on total: <span className="font-bold text-dark">₹{totalAddon.toLocaleString('en-IN')}/mo</span>
              </div>
              <a
                href="/build-your-own"
                className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                Full Configurator →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
