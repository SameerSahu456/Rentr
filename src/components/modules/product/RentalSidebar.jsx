import { Truck } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function RentalSidebar({
  product,
  rentalType,
  setRentalType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  tenureMonths,
  setTenureMonths,
  tenurePercent,
  qty,
  setShowLongTermModal,
  setShowNeedHelpModal,
  couponCode,
  setCouponCode,
  benefitsMarquee,
  onBookPlan,
  addingToCart,
}) {
  return (
    <div className="w-full lg:w-[395px] shrink-0 lg:border-l border-t lg:border-t-0 border-gray-200 bg-white">
      <div className="sticky top-20 p-6">
        {/* Product name */}
        <h2 className="font-heading text-lg font-bold text-dark">{product.name}</h2>

        {/* Rent / Lease toggle */}
        <p className="text-sm text-gray-500 mt-3 mb-2">Customise your tenure</p>
        <div className="flex gap-0 mb-4">
          <button
            onClick={() => setRentalType('rent')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-l-lg border transition-colors ${
              rentalType === 'rent'
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            Rent it
          </button>
          <button
            onClick={() => setRentalType('lease')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-r-lg border border-l-0 transition-colors ${
              rentalType === 'lease'
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            Lease it
          </button>
        </div>

        {/* Date pickers */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Rental Start date</label>
            <input
              type="text"
              placeholder="DD/MM/YY"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Rental End date</label>
            <input
              type="text"
              placeholder="DD/MM/YY"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Tenure slider */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">How long do you want to rent this for? (Months)</p>
          <div className="relative pt-1 pb-2">
            <div className="h-1.5 bg-gray-200 rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${tenurePercent}%` }}
              />
            </div>
            <input
              type="range"
              min="6"
              max="24"
              step="6"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="absolute top-0 w-full h-6 opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-0 w-4 h-4 bg-white border-2 border-primary rounded-full -translate-x-1/2 transition-all"
              style={{ left: `${tenurePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>6+</span>
            <span>12+</span>
            <span>24+</span>
          </div>
        </div>

        {/* Long term plans link */}
        <button
          onClick={() => setShowLongTermModal(true)}
          className="flex items-center gap-2 text-sm text-gray-600 mb-4"
        >
          Save more by choosing our long term tenure plans
          <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">!</span>
        </button>

        {/* Qty & Availability */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">Qty</span>
            <div className="border border-gray-200 rounded px-3 py-1 ml-2">
              <span className="text-sm">{qty}</span>
            </div>
          </div>
          <span className="text-sm">
            Availability : <span className="text-green-600 font-medium">In Stock</span>
          </span>
        </div>

        {/* Free delivery */}
        <div className="flex items-center gap-2 mb-5">
          <Truck size={16} className="text-gray-500" />
          <span className="text-sm text-gray-600">
            Free delivery in : <strong className="text-dark">72 hours</strong>
          </span>
        </div>

        {/* Price */}
        <div className="mb-5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-heading font-bold text-dark">₹{product.pricePerMonth.toLocaleString()}</span>
            <span className="text-sm text-gray-500">/ Mo</span>
            <span className="text-sm text-gray-400 ml-2">— Monthly Rent (Approx)</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <button
          onClick={onBookPlan}
          disabled={addingToCart}
          className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors mb-3 disabled:opacity-60"
        >
          {addingToCart ? 'Adding to cart...' : 'Book your plan'}
        </button>
        <Link to="/build-your-own" className="w-full border border-gray-300 text-dark font-semibold py-3 rounded-lg hover:border-primary hover:text-primary transition-colors mb-3 block text-center">
          Build your own
        </Link>
        <button
          onClick={() => setShowNeedHelpModal(true)}
          className="w-full text-center text-sm text-gray-500 hover:text-primary transition-colors"
        >
          Need help?
        </button>

        {/* Benefits marquee */}
        <div className="mt-5 overflow-hidden">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {benefitsMarquee.map((item, i) => (
              <span key={i} className="flex items-center gap-1 whitespace-nowrap">
                {item}
                {i < benefitsMarquee.length - 1 && <span className="mx-1">•</span>}
              </span>
            ))}
            <button className="text-primary font-medium whitespace-nowrap">View All &gt;</button>
          </div>
        </div>

        {/* Special Offer */}
        <div className="mt-5 border-t border-gray-100 pt-5">
          <h4 className="text-sm font-semibold text-dark mb-2">Special Offer</h4>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-gray-500">Use Code:</span>
              <input
                type="text"
                placeholder="RENTR"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="border border-gray-200 rounded px-3 py-1.5 text-sm w-24 focus:outline-none focus:border-primary"
              />
              <button className="text-primary text-sm font-medium border border-primary rounded px-3 py-1.5 hover:bg-primary hover:text-white transition-colors">
                Copy
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Get 5% off every month on a min...
          </p>
        </div>

        {/* Rental policy points */}
        <div className="mt-5 space-y-2 text-xs text-gray-500">
          <p>• Rentr users get ₹1k for each verification claim of only EMI, aside your verification process may take 48-hrs and a service bill be acquired.</p>
          <p>• Minimum six rental periods 6 months.</p>
          <p>• Customers can send GST no to be confirmed before delivery</p>
        </div>
      </div>
    </div>
  )
}
