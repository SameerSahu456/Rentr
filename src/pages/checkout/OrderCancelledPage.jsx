import { AlertCircle } from 'lucide-react'
import OrderStatusLayout, { OrderDetailsCard, DetailRow } from './OrderStatusLayout'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BREADCRUMB = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/search' },
  { label: 'Server', to: '/search?category=server' },
  { label: 'Dell Server' },
]

const CANCELLATION_DETAILS = [
  { label: 'Order Number', value: '#1234567890' },
  { label: 'Order date', value: '19th May, 2021, 22:47' },
  { label: 'Cancellation date', value: '19th May, 2021, 23:02' },
  {
    label: 'Delivery Details',
    value: '123, Business Park Road, Andheri East, Mumbai, Maharashtra 400069',
  },
]

const SUMMARY = [
  { label: 'Subtotal', value: '₹36,588' },
  { label: 'Delivery charges', value: '₹0' },
  { label: 'GST (18%)', value: '₹6,586' },
  { label: 'Amount refunded', value: '₹0.00', isTotal: true },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OrderCancelledPage() {
  return (
    <OrderStatusLayout
      breadcrumbItems={BREADCRUMB}
      icon={AlertCircle}
      iconColor="#eb5757"
      iconBg="#fdeaea"
      heading="Sorry, Your order has been cancelled"
      subtitle="You were not billed for any items. If you feel this is an error, please contact our support team."
      detailsCard={
        <OrderDetailsCard title="Order Cancellation Summary" summaryItems={SUMMARY}>
          {CANCELLATION_DETAILS.map((row, i) => (
            <DetailRow key={i} label={row.label} value={row.value} />
          ))}
        </OrderDetailsCard>
      }
    />
  )
}
