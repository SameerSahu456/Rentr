import { Link } from 'react-router-dom'
import { CheckCircle, Circle, Check, CircleDot } from 'lucide-react'
import { Badge } from './SubscriptionCard'
import { DEFAULT_PRODUCT_IMAGE, handleImgError } from '../../../constants/images'

// ─── Refund Tracking ───
// variant: 'customer' | 'distributor'

// Customer timeline (same as OrderTracking)
const RefundTimeline = ({ steps }) => (
  <div className="relative">
    {steps.map((step, i) => (
      <div key={i} className="flex gap-4 pb-8 last:pb-0">
        <div className="flex flex-col items-center">
          {step.done ? (
            <CheckCircle size={22} className="text-primary shrink-0" />
          ) : (
            <Circle size={22} className="text-gray-300 shrink-0" />
          )}
          {i < steps.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
        </div>
        <div className="pt-0.5">
          <p className={`text-sm font-semibold ${step.done ? 'text-gray-1' : 'text-gray-3'}`}>{step.label}</p>
          {step.detail && <p className="text-xs text-gray-3 mt-0.5">{step.detail}</p>}
        </div>
      </div>
    ))}
  </div>
)

export default function RefundTracking({
  variant = 'customer',
  // Customer props
  refundSteps,
  refundSummary,
  // Distributor props
  refundTrackData,
  formatCurrency,
  statusBadgeMap,
}) {
  if (variant === 'distributor') {
    return (
      <div className="space-y-6">
        <h3 className="font-heading text-lg font-bold text-dark uppercase tracking-wide">Track Return and Refund</h3>

        {refundTrackData.map((refund, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4 mb-5">
              <img src={refund.image} alt={refund.item} className="w-14 h-14 rounded-xl object-cover shrink-0" onError={handleImgError} loading="lazy" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-heading text-base font-bold text-dark">{refund.item}</h4>
                    <p className="text-xs text-gray-3 mt-0.5">Qty: {refund.qty}</p>
                  </div>
                  <Badge status={refund.status} statusBadgeMap={statusBadgeMap} />
                </div>
                <p className="text-sm font-semibold text-dark mt-2">Refund Amount: <span className="text-primary">{formatCurrency(refund.refundAmount)}</span></p>
              </div>
            </div>

            {/* Timeline stepper */}
            <div className="flex items-start justify-between">
              {refund.steps.map((step, i) => (
                <div key={i} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                      step.done ? 'bg-primary text-white' : 'bg-gray-200 text-gray-3'
                    }`}>
                      {step.done ? <Check size={16} /> : <CircleDot size={16} />}
                    </div>
                    <p className={`text-xs font-medium mt-2 text-center ${step.done ? 'text-dark' : 'text-gray-3'}`}>{step.label}</p>
                    {step.date && <p className="text-[10px] text-gray-3 mt-0.5">{step.date}</p>}
                  </div>
                  {i < refund.steps.length - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-0.5 ${step.done ? 'bg-primary' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Customer variant - Track
  const renderRefundSummary = () => (
    <div className="bg-[#fcfcfc] border border-gray-100 rounded-xl p-5">
      <h4 className="font-heading text-base sm:text-lg font-bold text-gray-1 mb-1">Refund Summary</h4>
      <div className="w-8 h-0.5 bg-primary mb-3" />
      <p className="text-sm text-gray-1 mb-4">
        <span className="font-bold">Rs {refundSummary.amount.toLocaleString()}</span> will be sent to your payment card/wallet
      </p>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-3">Refund Subtotal for 3 items</span>
          <span className="text-gray-1">₹{refundSummary.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-3">Discount deduction</span>
          <span className="text-gray-1">- ₹{refundSummary.discount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-3">Delivery deduction</span>
          <span className="text-gray-1">- ₹{refundSummary.delivery.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-3 font-semibold">
          <span className="text-gray-1">Total expected refund</span>
          <span className="text-gray-1">₹{refundSummary.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="flex-1"><RefundTimeline steps={refundSteps} /></div>
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="h-32 bg-gray-50 rounded mb-3 flex items-center justify-center overflow-hidden p-3">
              <img src={DEFAULT_PRODUCT_IMAGE} alt="PowerEdge T30" className="max-h-full max-w-full object-contain" onError={handleImgError} loading="lazy" />
            </div>
            <p className="text-sm font-medium text-gray-1">PowerEdge T30 Mini Tower Server</p>
            <p className="text-sm text-gray-3 mt-1">₹3,000/month</p>
          </div>
          {renderRefundSummary()}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-5">
          <h4 className="font-heading text-base font-bold text-gray-1 mb-1">Shipped with rentr</h4>
          <div className="w-8 h-0.5 bg-primary mb-4" />
          <Link to="#" className="text-primary text-sm font-medium hover:underline">Request Cancellation &gt;</Link>
          <p className="text-sm text-gray-1 mt-3">Tracking ID : <span className="font-semibold">2323948394874wt</span></p>
        </div>
        <div className="border border-gray-200 rounded-lg p-5">
          <h4 className="font-heading text-base font-bold text-gray-1 mb-1">Shipped Address</h4>
          <div className="w-8 h-0.5 bg-primary mb-4" />
          <p className="text-sm text-gray-1">Flat No 302, Nensey Society, Plot no.16, Bandra., Maharashtra - 400050</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-5">
          <h4 className="font-heading text-base font-bold text-gray-1 mb-1">Order Info</h4>
          <div className="w-8 h-0.5 bg-primary mb-4" />
          <button className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors">
            View Order details
          </button>
        </div>
      </div>
    </div>
  )
}
