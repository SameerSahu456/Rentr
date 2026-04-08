import { XCircle } from 'lucide-react'
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

const PAYMENT_DETAILS = [
  { label: 'Transaction Number', value: 'TXN-20210519-48293' },
  { label: 'Order date', value: '19th May, 2021, 22:47' },
  {
    label: 'Delivery Details',
    value: '123, Business Park Road, Andheri East, Mumbai, Maharashtra 400069',
  },
]

const SUMMARY = [
  { label: 'Subtotal', value: '₹36,588' },
  { label: 'Delivery charges', value: '₹0' },
  { label: 'GST (18%)', value: '₹6,586' },
  { label: 'Total', value: '₹43,174', isTotal: true },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PaymentFailurePage() {
  return (
    <OrderStatusLayout
      breadcrumbItems={BREADCRUMB}
      icon={XCircle}
      iconColor="#eb5757"
      iconBg="#fdeaea"
      heading="Sorry, Your order could not be completed"
      subtitle={
        <span>
          The payment for this transaction has{' '}
          <span className="font-semibold" style={{ color: '#eb5757' }}>
            failed
          </span>
        </span>
      }
      detailsCard={
        <OrderDetailsCard title="Payment Failure Details" summaryItems={SUMMARY}>
          <div
            className="rounded-xl p-4 mb-5"
            style={{ backgroundColor: '#fef3f2', border: '1px solid #fecdca' }}
          >
            <p style={{ fontSize: '13px', color: '#eb5757' }}>
              Your payment could not be processed. Please retry with a different payment
              method or contact your bank for more information.
            </p>
          </div>

          {PAYMENT_DETAILS.map((row, i) => (
            <DetailRow key={i} label={row.label} value={row.value} />
          ))}
        </OrderDetailsCard>
      }
    />
  )
}
