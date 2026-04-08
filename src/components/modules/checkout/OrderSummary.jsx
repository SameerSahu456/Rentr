import { handleImgError } from '../../../constants/images'
import {
  Pencil,
  Truck,
  Info,
  ChevronRight,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Distributor Order Summary (accordion content)                      */
/* ------------------------------------------------------------------ */

export function DistributorOrderSummary({
  cartItems,
  totalMonthly,
  gstAmount,
  totalWithGst,
  coupon,
  onCouponChange,
  billingAddress,
  shippingAddress,
  sameAsBilling,
  onProceedToPayment,
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-3">Review your order before payment</span>
        <button className="text-primary text-sm font-medium hover:underline">
          Review your order
        </button>
      </div>

      {/* Delivery Address Card */}
      <div className="bg-white rounded-xl p-5 mb-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-heading font-semibold text-dark text-sm mb-1">
              Your delivery Address
            </h4>
            <p className="text-sm text-gray-3">
              {sameAsBilling
                ? [billingAddress.address1, billingAddress.address2, billingAddress.townCity, billingAddress.state, billingAddress.pinCode].filter(Boolean).join(', ') || 'Not provided'
                : [shippingAddress.address1, shippingAddress.address2, shippingAddress.townCity, shippingAddress.state, shippingAddress.pinCode].filter(Boolean).join(', ') || 'Not provided'
              }
            </p>
          </div>
          <button className="text-primary hover:text-primary-dark transition-colors">
            <Pencil size={16} />
          </button>
        </div>
      </div>

      {/* Monthly Payable Breakdown */}
      <div className="space-y-3 mb-6">
        <h4 className="font-heading font-semibold text-dark">Monthly Payable</h4>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-3">Base monthly rent</span>
          <span className="text-dark">{'\u20B9'}{totalMonthly.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-3">GST (18%)</span>
          <span className="text-dark">{'\u20B9'}{gstAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between font-semibold pt-2 border-t border-gray-100">
          <span className="text-dark">Total Monthly Rent</span>
          <span className="text-dark">{'\u20B9'}{totalWithGst.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2 mb-6">
        <p className="text-sm text-gray-3">Pay before usage every month</p>
        <div className="inline-flex items-center gap-2 text-green-700 text-sm font-medium">
          <Truck size={16} />
          Free delivery by: 7th August, 2021
        </div>
        <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-3 mt-2">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Subject to verification. 90% profiles get verified within just 3 hrs.
          </p>
        </div>
      </div>

      {/* Coupon */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-2 mb-2">Have a coupon code?</p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={coupon}
            onChange={(e) => onCouponChange(e.target.value)}
            placeholder="Enter coupon code"
            className="w-full border border-gray-200 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400 max-w-xs"
          />
          <button className="btn-primary !px-6 !py-2.5 text-sm">
            Apply
          </button>
        </div>
      </div>

      {/* Amount to pay now */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-3">Amount to be paid now</p>
            <span className="font-heading text-2xl font-bold text-dark">
              {'\u20B9'} {totalWithGst.toLocaleString('en-IN')}/mo
            </span>
          </div>
          <button
            onClick={onProceedToPayment}
            className="bg-primary text-white px-8 py-3 rounded-full font-medium transition-all duration-200 hover:bg-primary-dark active:scale-[0.98] cursor-pointer flex items-center gap-2"
          >
            Proceed to payment <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Distributor Item Summary List                                      */
/* ------------------------------------------------------------------ */

export function DistributorItemSummary({ cartItems }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
      <h4 className="font-heading font-semibold text-dark mb-4">Item Summary</h4>
      <div className="space-y-5">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-4 pb-5 border-b border-gray-50 last:border-0 last:pb-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 rounded-xl object-cover bg-gray-100 shrink-0"
              onError={handleImgError}
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-dark">{item.name}</p>
                  <p className="text-xs text-gray-3 mt-0.5">Qty: {item.qty}</p>
                  <p className="text-xs text-gray-3">Delivery: {item.deliveryDate}</p>
                  <p className="text-xs text-gray-3">Tenure: {item.tenure}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-heading font-semibold text-dark text-sm">
                    {'\u20B9'}{(item.monthlyRent + item.addonsRent).toLocaleString('en-IN')}/mo
                  </span>
                </div>
              </div>
              {/* Sub-items */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {item.subItems.map((sub, idx) => (
                  <span key={idx} className="text-xs text-gray-3">
                    {sub.label}: <span className="text-dark font-medium">{sub.value}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
