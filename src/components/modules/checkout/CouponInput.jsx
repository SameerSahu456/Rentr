import { Tag } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Customer Coupon Input (with Tag icon, purple Apply button)         */
/* ------------------------------------------------------------------ */

export function CustomerCouponInput({ coupon, onCouponChange }) {
  return (
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
          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
        />
      </div>
      <button className="bg-[#6d5ed6] text-white text-sm font-['Poppins'] font-medium px-5 py-2.5 rounded-lg hover:bg-[#5b4ec4] transition-colors">
        Apply
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Distributor Coupon Input (with Tag icon, text Apply link)          */
/* ------------------------------------------------------------------ */

export function DistributorCouponInput({ coupon, onCouponChange }) {
  return (
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
          className="w-full border border-gray-300 rounded-lg h-[48px] pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
        />
      </div>
      <button className="text-primary font-semibold text-sm hover:underline">
        Apply
      </button>
    </div>
  )
}
