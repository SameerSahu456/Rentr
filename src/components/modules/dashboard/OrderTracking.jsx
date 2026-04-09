import { Link } from 'react-router-dom'
import { CheckCircle, Circle, ChevronLeft, ChevronRight, Check, CircleDot, Package, Truck, MapPin, FileText } from 'lucide-react'
import { DEFAULT_PRODUCT_IMAGE, handleImgError } from '../../../constants/images'

// ─── Customer Timeline ───
const CustomerTimeline = ({ steps }) => (
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

// ─── Distributor Timeline ───
const DistributorTimeline = ({ steps }) => (
  <div className="relative">
    {steps.map((step, i) => (
      <div key={i} className="flex gap-4 mb-6 last:mb-0">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            step.done ? 'bg-primary text-white' : 'bg-gray-200 text-gray-3'
          }`}>
            {step.done ? <Check size={16} /> : <CircleDot size={16} />}
          </div>
          {i < steps.length - 1 && (
            <div className={`w-0.5 flex-1 min-h-[32px] ${step.done ? 'bg-primary' : 'bg-gray-200'}`} />
          )}
        </div>
        <div className="pt-1">
          <p className={`text-sm font-semibold ${step.done ? 'text-dark' : 'text-gray-3'}`}>{step.label}</p>
          {step.date && <p className="text-xs text-gray-3 mt-0.5">{step.date}</p>}
          {step.sub && <p className="text-xs text-gray-3">{step.sub}</p>}
        </div>
      </div>
    ))}
  </div>
)

export default function OrderTracking({
  variant = 'customer',
  // Customer props
  trackOrders,
  orderListItems,
  mobileTrackingOrder,
  setMobileTrackingOrder,
  // Distributor props
  selectedOrder,
  setSelectedOrder,
  hasOngoingOrders,
  formatCurrency,
}) {
  if (variant === 'distributor') {
    const order = trackOrders[selectedOrder]
    const steps = [
      { label: 'Ordered', date: order?.orderedOn, done: true },
      { label: 'Shipped', date: order?.shippedOn, sub: order?.shippedFrom, done: !!order?.shippedOn },
      { label: 'Out for delivery', date: order?.outForDelivery, done: !!order?.outForDelivery },
      { label: 'Arriving', date: order?.arriving, done: false },
    ]

    return hasOngoingOrders ? (
      <div className="space-y-6">
        {/* Order selector */}
        {trackOrders.length > 1 && (
          <div className="flex gap-2">
            {trackOrders.map((o, i) => (
              <button
                key={i}
                onClick={() => setSelectedOrder(i)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  selectedOrder === i ? 'bg-primary text-white' : 'bg-gray-100 text-gray-2 hover:bg-gray-200'
                }`}
              >
                {o.item}
              </button>
            ))}
          </div>
        )}

        {/* Timeline + Product */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Timeline */}
            <div className="flex-1">
              <DistributorTimeline steps={steps} />
            </div>

            {/* Product details */}
            <div className="lg:w-64 shrink-0">
              <img src={order.image} alt={order.item} className="w-20 h-20 rounded-xl object-cover mb-3" onError={handleImgError} loading="lazy" />
              <h4 className="font-heading text-base font-bold text-dark">{order.item}</h4>
              <p className="text-xs text-gray-3 mt-1">Qty: {order.qty} | {order.rentalPeriod}</p>
              <p className="text-sm font-semibold text-dark mt-2">{formatCurrency(order.unitPrice)}/mo</p>
            </div>
          </div>
        </div>

        {/* Bottom info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Truck size={16} className="text-primary" />
              <h5 className="text-sm font-semibold text-dark">Shipped with rentr</h5>
            </div>
            <p className="text-xs text-gray-3">Tracking ID: <span className="text-dark font-medium">{order.trackingId}</span></p>
            <button className="text-xs text-red-500 hover:underline mt-2 font-medium">Request Cancellation</button>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-primary" />
              <h5 className="text-sm font-semibold text-dark">Shipped Address</h5>
            </div>
            <p className="text-xs text-gray-2 leading-relaxed">{order.shippedAddress}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-primary" />
              <h5 className="text-sm font-semibold text-dark">Order Info</h5>
            </div>
            <p className="text-xs text-gray-3 mb-3">Order ID: {order.orderInfo}</p>
            <button className="px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors">
              View Order details
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
        <Package size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-3 text-lg mb-2">No ongoing orders</p>
        <Link to="/search" className="inline-flex items-center gap-2 mt-3 btn-primary px-6 py-3 text-sm font-medium">
          Browse Products <ChevronRight size={16} />
        </Link>
      </div>
    )
  }

  // Customer variant
  if (mobileTrackingOrder !== null) {
    const order = trackOrders[0]
    return (
      <div>
        <button onClick={() => setMobileTrackingOrder(null)}
          className="lg:hidden flex items-center gap-1 text-sm text-gray-3 mb-4 cursor-pointer">
          <ChevronLeft size={14} /> Back to orders
        </button>
        <div className="border border-gray-300 rounded-lg p-4 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-50 rounded flex items-center justify-center shrink-0 overflow-hidden p-1">
            <img src={DEFAULT_PRODUCT_IMAGE} alt={order.productName} className="max-h-full max-w-full object-contain" onError={handleImgError} loading="lazy" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-1">{order.productName}</p>
            <p className="text-sm text-gray-3">{order.productPrice}</p>
          </div>
        </div>
        <CustomerTimeline steps={order.steps} />
        <div className="space-y-4 mt-8">
          <div className="border border-gray-300 rounded-lg p-5">
            <h4 className="font-heading text-base font-bold text-gray-1 mb-1">Shipped with rentr</h4>
            <div className="w-8 h-0.5 bg-primary mb-4" />
            <Link to="#" className="text-primary text-sm font-medium hover:underline">Request Cancellation &gt;</Link>
            <p className="text-sm text-gray-1 mt-3">Tracking ID : <span className="font-semibold">{order.trackingId}</span></p>
          </div>
          <div className="border border-gray-300 rounded-lg p-5">
            <h4 className="font-heading text-base font-bold text-gray-1 mb-1">Shipped Address</h4>
            <div className="w-8 h-0.5 bg-primary mb-4" />
            <p className="text-sm text-gray-1">{order.address}</p>
          </div>
          <div className="border border-gray-300 rounded-lg p-5">
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

  // Customer - desktop & mobile list
  return (
    <>
      <div className="lg:hidden space-y-0 divide-y divide-gray-100">
        {orderListItems.map((order, i) => (
          <button key={i} onClick={() => setMobileTrackingOrder(i)}
            className="w-full flex items-center justify-between py-4 text-left cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-1">{order.name}</p>
              <p className="text-xs text-gray-3 mt-0.5">{order.status}</p>
            </div>
            <ChevronRight size={18} className="text-gray-300 shrink-0" />
          </button>
        ))}
      </div>
      <div className="hidden lg:block">
        {trackOrders.map((order) => (
          <div key={order.id}>
            <div className="flex gap-8 mb-8">
              <div className="flex-1"><CustomerTimeline steps={order.steps} /></div>
              <div className="w-64 shrink-0">
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="h-32 bg-gray-50 rounded mb-3 flex items-center justify-center overflow-hidden p-3">
                    <img src={DEFAULT_PRODUCT_IMAGE} alt="Product" className="max-h-full max-w-full object-contain" onError={handleImgError} loading="lazy" />
                  </div>
                  <p className="text-sm font-medium text-gray-1">{order.productName}</p>
                  <p className="text-sm text-gray-3 mt-1">{order.productPrice}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-gray-300 rounded-lg p-5">
                <h4 className="font-heading text-base font-bold text-gray-1 mb-1">Shipped with rentr</h4>
                <div className="w-8 h-0.5 bg-primary mb-4" />
                <Link to="#" className="text-primary text-sm font-medium hover:underline">Request Cancellation &gt;</Link>
                <p className="text-sm text-gray-1 mt-3">Tracking ID : <span className="font-semibold">{order.trackingId}</span></p>
              </div>
              <div className="border border-gray-300 rounded-lg p-5">
                <h4 className="font-heading text-base font-bold text-gray-1 mb-1">Shipped Address</h4>
                <div className="w-8 h-0.5 bg-primary mb-4" />
                <p className="text-sm text-gray-1">{order.address}</p>
              </div>
              <div className="border border-gray-300 rounded-lg p-5">
                <h4 className="font-heading text-base font-bold text-gray-1 mb-1">Order Info</h4>
                <div className="w-8 h-0.5 bg-primary mb-4" />
                <button className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors">
                  View Order details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export { CustomerTimeline, DistributorTimeline }
