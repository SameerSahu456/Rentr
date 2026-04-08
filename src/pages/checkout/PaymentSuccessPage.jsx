import { useLocation } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import OrderStatusLayout, { OrderDetailsCard, DetailRow } from './OrderStatusLayout'
import { useAuth } from '../../context/AuthContext'

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PaymentSuccessPage() {
  const { user } = useAuth()
  const location = useLocation()
  const order = location.state?.order

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  const orderDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const addressParts = order?.shipping_address
    ? [order.shipping_address.line1, order.shipping_address.line2, order.shipping_address.city, order.shipping_address.state, order.shipping_address.pincode].filter(Boolean).join(', ')
    : ''

  const BREADCRUMB = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/search' },
    { label: 'Order Confirmation' },
  ]

  const ORDER_DETAILS = [
    { label: 'Confirmation email', value: user?.email || '' },
    { label: 'Order Number', value: order ? `#${order.id}` : '' },
    { label: 'Order date', value: orderDate },
    ...(addressParts ? [{ label: 'Delivery Details', value: addressParts }] : []),
    { label: 'Rental Duration', value: order ? `${order.rental_months} Months` : '' },
  ]

  const subtotal = order?.total_amount || 0
  const gst = Math.round(subtotal * 0.18)
  const total = subtotal + gst

  const SUMMARY = [
    { label: 'Subtotal', value: fmt(subtotal) },
    { label: 'Delivery charges', value: '₹0' },
    { label: 'GST (18%)', value: fmt(gst) },
    { label: 'Total', value: fmt(total), isTotal: true },
  ]

  return (
    <OrderStatusLayout
      breadcrumbItems={BREADCRUMB}
      icon={CheckCircle2}
      iconColor="#27ae60"
      iconBg="#e8f8ef"
      heading="Thanks for your Order"
      subtitle="We're processing your order now, here are the details."
      showFeedback
      detailsCard={
        <OrderDetailsCard title="Order Details" summaryItems={SUMMARY}>
          {order && (
            <p className="mb-4" style={{ fontSize: '13px', color: '#828282' }}>
              Order reference code:{' '}
              <span className="font-semibold" style={{ color: '#333' }}>
                RENTR-{order.id}
              </span>
            </p>
          )}

          {ORDER_DETAILS.map((row, i) => (
            <DetailRow key={i} label={row.label} value={row.value} />
          ))}
        </OrderDetailsCard>
      }
    />
  )
}
