import { X, ChevronLeft, ChevronRight, CreditCard, CalendarDays, Upload, Clock } from 'lucide-react'
import { handleImgError } from '../../../constants/images'

// ─── Cancel Modal ───
// variant: 'customer' | 'distributor'

export default function CancelModal({
  variant = 'customer',
  show,
  onClose,
  cancelReasons,
  toggleCancelReason,
  subscriptionData,
  // Customer-specific props
  cancelDate,
  setCancelDate,
  cancelForm,
  setCancelForm,
  // Distributor-specific props
  cancelAssets,
  toggleCancelAsset,
}) {
  if (!show) return null

  if (variant === 'distributor') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="font-heading text-lg font-bold text-dark">Cancel Subscription</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <p className="text-sm font-semibold text-dark mb-3">Select assets to cancel</p>
              {subscriptionData.filter((a) => a.status === 'Active').map((asset) => (
                <label key={asset.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cancelAssets.includes(asset.id)}
                    onChange={() => toggleCancelAsset(asset.id)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <img src={asset.image} alt={asset.brand} className="w-10 h-10 rounded-lg" onError={handleImgError} loading="lazy" />
                  <div>
                    <p className="text-sm font-medium text-dark">{asset.brand} {asset.model}</p>
                    <p className="text-xs text-gray-3">Qty: {asset.qty} | {asset.tenure}</p>
                  </div>
                </label>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-dark mb-3">Reason for cancellation</p>
              {['Too expensive', 'Not needed anymore', 'Switching to another provider', 'Poor service quality', 'Equipment issues', 'Other'].map((reason) => (
                <label key={reason} className="flex items-center gap-3 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cancelReasons.includes(reason)}
                    onChange={() => toggleCancelReason(reason)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-2">{reason}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Confirm Cancellation
              </button>
              <button
                onClick={onClose}
                className="btn-outline flex-1 py-3 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Customer variant
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-5 sm:p-6">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-gray-1 mb-6">Cancel Subscription</h3>

          {/* Assets Carousel */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-2 uppercase tracking-wider">Assets</p>
              <div className="flex gap-2">
                <button className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-3 hover:bg-gray-50 cursor-pointer"><ChevronLeft size={14} /></button>
                <button className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-3 hover:bg-gray-50 cursor-pointer"><ChevronRight size={14} /></button>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {subscriptionData.slice(0, 2).map((asset) => (
                <div key={asset.id} className="shrink-0 w-[160px]">
                  <div className="h-24 bg-gray-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden p-2">
                    <img src={asset.image} alt={asset.name} className="max-h-full max-w-full object-contain" onError={handleImgError} loading="lazy" />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-gray-1">{asset.name}</h4>
                  <p className="text-xs text-gray-3 mt-0.5">Quantity : {asset.quantity}  (Includes {asset.includes} Items)</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-3 mt-1">
                    <CreditCard size={11} />
                    <span>Monthly Rent: ₹{asset.monthlyRent.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs mt-0.5">
                    <CalendarDays size={11} className="text-gray-3" />
                    <span className="text-gray-3">Tenure #{asset.tenure}</span>
                    {asset.expiringSoon && <span className="text-[#eb5757] text-[10px]">(Expiring Soon)</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm text-gray-1 mb-2">Asset(s) to be returned on</label>
            <div className="relative">
              <input type="text" value={cancelDate} onChange={(e) => setCancelDate(e.target.value)} className="input-field-rect" />
              <CalendarDays size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-3" />
            </div>
          </div>

          <p className="text-sm font-medium text-gray-1 mb-4">Please provide the following information:</p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-gray-1 mb-1.5">Collection to be done by*</label>
              <input type="text" placeholder="Enter name here" value={cancelForm.collectionBy}
                onChange={(e) => setCancelForm({ ...cancelForm, collectionBy: e.target.value })} className="input-field-rect" />
            </div>
            <div>
              <label className="block text-sm text-gray-1 mb-1.5">Contact Number</label>
              <input type="tel" placeholder="Enter contact number" value={cancelForm.contactNumber}
                onChange={(e) => setCancelForm({ ...cancelForm, contactNumber: e.target.value })} className="input-field-rect" />
            </div>
            <div>
              <label className="block text-sm text-gray-1 mb-1.5">Email ID (optional)</label>
              <input type="email" placeholder="eg. example@email.com" value={cancelForm.email}
                onChange={(e) => setCancelForm({ ...cancelForm, email: e.target.value })} className="input-field-rect" />
            </div>
            <div>
              <label className="block text-sm text-gray-1 mb-1.5">Tracking ID</label>
              <input type="text" placeholder="Enter tracking number" value={cancelForm.trackingId}
                onChange={(e) => setCancelForm({ ...cancelForm, trackingId: e.target.value })} className="input-field-rect" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm text-gray-1">Payment ID *</label>
                <label className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary cursor-pointer">
                  <Upload size={14} /><span className="font-medium">Upload Proof of payment*</span>
                  <input type="file" className="hidden" />
                </label>
              </div>
              <input type="text" placeholder="Eg. CDI24F33IV" value={cancelForm.paymentId}
                onChange={(e) => setCancelForm({ ...cancelForm, paymentId: e.target.value })} className="input-field-rect" />
            </div>
            <div>
              <label className="block text-sm text-gray-1 mb-1.5">Time of delivery (optional)</label>
              <div className="relative">
                <input type="text" placeholder="HH:MM - HH : MM" value={cancelForm.deliveryTime}
                  onChange={(e) => setCancelForm({ ...cancelForm, deliveryTime: e.target.value })} className="input-field-rect" />
                <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-3" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-1 mb-3">Reason for cancelling your Subscription</p>
            <div className="space-y-3">
              {['Business Relocation', 'I find Rentr too expensive', 'I was not happy with Rentr service(s) /product(s)', 'I have bought assets'].map((reason) => (
                <label key={reason} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={cancelReasons.includes(reason)} onChange={() => toggleCancelReason(reason)}
                    className="w-4 h-4 accent-primary rounded" />
                  <span className="text-sm text-gray-1">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-[#fff3cd] rounded-lg px-4 py-3 mb-4">
            <p className="text-xs text-gray-1">*Delivery charges are to be paid by the customer and will be included in the final invoice</p>
          </div>

          <div className="flex items-center justify-between border-t border-gray-300 pt-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-1"><span>🚚</span> Delivery charges</div>
            <span className="font-semibold text-gray-1">₹2000</span>
          </div>

          <div className="flex gap-3">
            <button className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-medium flex-1 hover:bg-primary-dark transition-colors">Place request</button>
            <button onClick={onClose}
              className="px-6 py-2.5 rounded-full border border-gray-300 text-sm font-medium text-gray-1 hover:bg-gray-50 transition-colors cursor-pointer">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
