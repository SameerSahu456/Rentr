import { handleImgError } from '../../../constants/images'
import {
  Trash2,
  Pencil,
  ChevronRight,
  Calendar,
  Truck,
  Tag,
  FileText,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Customer Cart Summary (split-panel: Monthly Payable + line items)  */
/* ------------------------------------------------------------------ */

export function CustomerCartSummary({
  cartItems,
  productsRent,
  addonsRent,
  totalMonthly,
  coupon,
  onCouponChange,
  onRemoveItem,
  onProceed,
  fmt,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Left half: Monthly Payable breakdown */}
        <div className="flex-1 p-6 lg:p-8">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#17113e] mb-6">
            Monthly Payable
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-['Poppins']">
              <span className="text-[#4f4f4f]">Products Rent</span>
              <span className="text-[#333] font-medium">
                {'\u20B9'}{fmt(productsRent)}/mo
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-['Poppins']">
              <span className="text-[#4f4f4f]">Addons Rent</span>
              <span className="text-[#333] font-medium">
                {'\u20B9'}{fmt(addonsRent)}/mo
              </span>
            </div>
            <div className="border-t border-[#e0e0e0] pt-3">
              <div className="flex items-center justify-between font-['Poppins']">
                <span className="text-[#333] font-semibold">
                  Total Monthly Rent
                </span>
                <span className="text-[#333] font-bold text-lg">
                  {'\u20B9'}{fmt(totalMonthly)}/mo
                </span>
              </div>
            </div>
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="inline-flex items-center gap-2 bg-[#f2f2f2] text-[#4f4f4f] text-xs font-['Poppins'] font-medium px-3 py-2 rounded-lg">
              <Calendar size={14} className="text-[#828282]" />
              Pay before usage every month
            </div>
            <div className="inline-flex items-center gap-2 bg-[#f2f2f2] text-[#4f4f4f] text-xs font-['Poppins'] font-medium px-3 py-2 rounded-lg">
              <Truck size={14} className="text-[#828282]" />
              Free delivery by: 7th August, 2021
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="hidden lg:block w-px bg-[#e0e0e0] my-6" />

        {/* Right half: Product line items */}
        <div className="flex-1 p-6 lg:p-8 border-t lg:border-t-0">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-['Poppins'] font-medium text-[#333]">
                    {item.name}
                  </p>
                  <p className="text-xs font-['Poppins'] text-[#828282] mt-0.5">
                    Rs {fmt(item.price)}/mo X {item.qty}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-[#bdbdbd] hover:text-red-500 transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    className="text-[#bdbdbd] hover:text-[#6d5ed6] transition-colors"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="flex items-center gap-3 mt-6">
            <div className="relative flex-1">
              <Tag
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bdbdbd]"
              />
              <input
                type="text"
                value={coupon}
                onChange={(e) => onCouponChange(e.target.value)}
                placeholder="Apply Coupon"
                className="w-full pl-9 pr-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>
            <button className="bg-[#6d5ed6] text-white text-sm font-['Poppins'] font-medium px-5 py-2.5 rounded-lg hover:bg-[#5b4ec4] transition-colors">
              Apply
            </button>
          </div>

          {/* Bottom total + Proceed */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e0e0e0]">
            <div>
              <p className="font-['Space_Grotesk'] text-xl font-bold text-[#17113e]">
                {'\u20B9'}{fmt(totalMonthly)}/Mo
              </p>
            </div>
            <button
              onClick={onProceed}
              className="bg-[#6d5ed6] text-white font-['Poppins'] font-medium px-6 py-2.5 rounded-lg hover:bg-[#5b4ec4] transition-colors flex items-center gap-2"
            >
              Proceed
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Distributor Cart Summary (table + sidebar)                         */
/* ------------------------------------------------------------------ */

export function DistributorCartTable({
  cartItems,
  coupon,
  onCouponChange,
}) {
  return (
    <>
      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 pr-4 font-medium text-gray-3">Product</th>
              <th className="text-right py-3 px-4 font-medium text-gray-3">Monthly Rent</th>
              <th className="text-right py-3 px-4 font-medium text-gray-3">Addons Rent</th>
              <th className="text-right py-3 pl-4 font-medium text-gray-3">Total Monthly Rent</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                      onError={handleImgError}
                      loading="lazy"
                    />
                    <div>
                      <p className="font-medium text-dark">{item.name}</p>
                      <p className="text-xs text-gray-3">{item.specs}</p>
                    </div>
                  </div>
                </td>
                <td className="text-right py-4 px-4 text-dark">
                  {'\u20B9'} {item.monthlyRent.toLocaleString('en-IN')}/mo
                </td>
                <td className="text-right py-4 px-4 text-dark">
                  {'\u20B9'} {item.addonsRent.toLocaleString('en-IN')}/mo
                </td>
                <td className="text-right py-4 pl-4 font-semibold text-dark">
                  {'\u20B9'} {(item.monthlyRent + item.addonsRent).toLocaleString('en-IN')}/mo
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pay note + Free delivery */}
      <div className="mt-5 space-y-2">
        <p className="text-sm text-gray-3">
          Pay before usage every month
        </p>
        <div className="inline-flex items-center gap-2 text-green-700 text-sm font-medium">
          <Truck size={16} />
          Free delivery by: 7th August, 2021
        </div>
      </div>

      {/* Coupon */}
      <div className="mt-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Tag
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={coupon}
            onChange={(e) => onCouponChange(e.target.value)}
            placeholder="Apply Coupon"
            className="w-full border border-gray-200 rounded-lg h-[48px] pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
          />
        </div>
        <button className="text-primary font-semibold text-sm hover:underline">
          Apply
        </button>
      </div>
    </>
  )
}

export function DistributorCartSidebar({
  cartItems,
  totalMonthly,
  onRemoveItem,
  onProceed,
}) {
  return (
    <div className="lg:w-80 shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
        <h4 className="font-heading font-semibold text-dark mb-4">Cart Items</h4>
        <div className="space-y-3 mb-5">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark truncate">{item.name}</p>
                <p className="text-xs text-gray-3">
                  {'\u20B9'}{item.pricePerMonth.toLocaleString('en-IN')}/mo x {item.qty}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button className="text-gray-400 hover:text-primary transition-colors" title="Edit">
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <hr className="border-gray-100 mb-4" />

        <div className="flex items-baseline justify-between mb-1">
          <span className="font-heading text-2xl font-bold text-dark">
            {'\u20B9'}{totalMonthly.toLocaleString('en-IN')}/Mo
          </span>
        </div>
        <p className="text-sm text-gray-3 mb-5">
          Monthly Rent (Approx)
        </p>

        <button
          onClick={onProceed}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          Proceed <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
