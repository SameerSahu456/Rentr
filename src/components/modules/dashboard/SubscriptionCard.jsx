import { CreditCard, CalendarDays } from 'lucide-react'
import { handleImgError } from '../../../constants/images'

// ─── Subscription Card ───
// variant: 'customer' | 'distributor'

// Customer subscription progress bar
const SubscriptionProgress = ({ subscribedOn, currentDate, expiringOn }) => (
  <div className="w-full max-w-[280px]">
    <div className="relative flex items-center justify-between mb-1">
      <div className="w-3 h-3 rounded-full bg-gray-1 z-10" />
      <div className="absolute left-0 right-0 h-0.5 bg-gray-300 top-1.5" />
      <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary z-10" />
      <div className="w-3 h-3 rounded-full bg-gray-1 z-10" />
    </div>
    <div className="flex justify-between text-[10px] text-gray-3">
      <div className="text-center">
        <p>Subscribed on</p>
        <p>{subscribedOn}</p>
      </div>
      <div className="text-center font-semibold text-gray-1">
        <p>Curret date</p>
        <p>{currentDate}</p>
      </div>
      <div className="text-center">
        <p>Expiring on</p>
        <p>{expiringOn}</p>
      </div>
    </div>
  </div>
)

// Distributor timeline bar
const TimelineBar = ({ startDate, endDate, progress, status }) => (
  <div className="mt-3">
    <div className="flex items-center justify-between text-[11px] text-gray-3 mb-1.5">
      <span>Subscribed on {startDate}</span>
      <span className="text-primary font-medium">Current</span>
      <span>{status === 'Expired' ? 'Expired on' : 'Expiring on'} {endDate}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all ${status === 'Expired' ? 'bg-red-400' : 'bg-primary'}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
)

// Distributor status badge
const Badge = ({ status, statusBadgeMap }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${
      statusBadgeMap?.[status] || 'bg-gray-100 text-gray-600'
    }`}
  >
    {status}
  </span>
)

export default function SubscriptionCard({ data, variant = 'customer', onExtend, onRenew, statusBadgeMap, formatCurrency }) {
  if (variant === 'distributor') {
    return (
      <div className="space-y-5">
        {data.map((asset) => (
          <div key={asset.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start gap-4">
              <img src={asset.image} alt={asset.brand} className="w-16 h-16 rounded-xl object-cover shrink-0" onError={handleImgError} loading="lazy" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-heading text-base font-bold text-dark">{asset.brand} {asset.model}</h4>
                    <p className="text-xs text-gray-3 mt-0.5">ID: {asset.itemId}</p>
                  </div>
                  <Badge status={asset.status} statusBadgeMap={statusBadgeMap} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Quantity</p>
                    <p className="text-sm font-medium text-dark">{asset.qty}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Monthly Rent</p>
                    <p className="text-sm font-semibold text-dark">{formatCurrency(asset.monthlyRent)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Tenure</p>
                    <p className="text-sm font-medium text-dark">{asset.tenure}</p>
                  </div>
                </div>

                <TimelineBar startDate={asset.startDate} endDate={asset.endDate} progress={asset.progress} status={asset.status} />

                <div className="mt-4">
                  {asset.status === 'Expired' ? (
                    <button
                      onClick={onRenew}
                      className="px-5 py-2 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
                    >
                      Renew
                    </button>
                  ) : (
                    <button
                      onClick={onRenew}
                      className="px-5 py-2 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
                    >
                      Extend
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Customer variant
  return (
    <div className="space-y-6">
      {data.map((asset) => (
        <div key={asset.id} className="flex flex-col md:flex-row gap-6 border-b border-gray-100 pb-6 last:border-0">
          <div className="w-full md:w-48 h-40 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden p-3">
            <img src={asset.image} alt={asset.name} className="max-h-full max-w-full object-contain" onError={handleImgError} loading="lazy" />
          </div>
          <div className="flex-1 flex flex-col md:flex-row md:justify-between gap-4">
            <div>
              <h4 className="font-heading text-lg font-bold text-gray-1">{asset.name}</h4>
              <p className="text-sm text-gray-3 mt-1">Quantity : {asset.quantity}  (Includes {asset.includes} items)</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard size={14} className="text-gray-3" />
                  <span className="text-gray-3">Monthly Rent:</span>
                  <span className="text-gray-1">₹{asset.monthlyRent.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays size={14} className="text-gray-3" />
                  <span className="text-gray-3">Tenure</span>
                  <span className={asset.expiringSoon ? 'text-[#eb5757]' : 'text-gray-1'}>
                    {asset.tenureLeft} {asset.expiringSoon && <span className="text-[#eb5757]">(Expiring Soon)</span>}
                  </span>
                </div>
              </div>
              {asset.autoRenew && (
                <p className="text-xs text-gray-3 mt-2 italic">Subscription auto-renews on {asset.autoRenew}</p>
              )}
            </div>
            <div className="flex flex-col items-start md:items-end gap-3">
              <SubscriptionProgress subscribedOn={asset.subscribedOn} currentDate={asset.currentDate} expiringOn={asset.expiringOn} />
              <button className="mt-2 px-6 py-2 rounded-full border border-gray-1 text-sm font-medium text-gray-1 hover:bg-gray-50 transition-colors cursor-pointer">
                Extend
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Export sub-components for use in modals
export { SubscriptionProgress, TimelineBar, Badge }
