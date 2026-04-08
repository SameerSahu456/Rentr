import { Download } from 'lucide-react'
import { DEFAULT_PRODUCT_IMAGE, handleImgError } from '../../../constants/images'

// ─── Payment Pending Card (Customer only) ───

export default function PaymentPendingCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 mb-6 shadow-sm">
      <div className="flex gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-lg shrink-0 overflow-hidden flex items-center justify-center p-1">
          <img src={DEFAULT_PRODUCT_IMAGE} alt="Product" className="max-h-full max-w-full object-contain" onError={handleImgError} loading="lazy" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-heading text-sm sm:text-base font-bold text-gray-1">Payment pending</h4>
          <button className="flex items-center gap-1.5 text-primary text-xs mt-0.5 cursor-pointer">
            <Download size={12} />
            Download Invoice
          </button>
          <p className="text-xs text-gray-3 mt-2 leading-relaxed">
            Your due date has passed! Please clear your dues as soon as early as possible
          </p>
          <div className="flex gap-6 mt-3">
            <div>
              <p className="text-xs font-bold text-gray-1">Balance Due</p>
              <p className="text-sm text-gray-3">Rs 1002</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-1">Due date</p>
              <p className="text-sm text-gray-3">29 Jun</p>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors">
              Pay now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
