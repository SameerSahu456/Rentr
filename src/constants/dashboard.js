import { PRODUCT_IMAGES } from './images'

// ─── Shared dashboard constants used by both Customer and Distributor dashboards ───

export const SUPPORT_TICKETS_CUSTOMER = [
  { item: 'Dell Latitude 5540', client: 'SBI Mutual Fund', createdBy: 'John Doe', createdOn: '20/11/2025', status: 'Open', assignedTo: 'Rahul S.', refund: '-' },
  { item: 'HPE Server DL 380', client: 'SBI Mutual Fund', createdBy: 'John Doe', createdOn: '15/10/2025', status: 'Resolved', assignedTo: 'Priya M.', refund: '₹500' },
]

export const SAVED_CARDS_CUSTOMER = [
  { id: 1, type: 'RuPay', bank: 'Axis Bank', cardType: 'Debit Card', last4: '2788' },
  { id: 2, type: 'RuPay', bank: 'State Bank of India', cardType: 'Debit Card', last4: '4666' },
]

export const CUSTOMER_SIDEBAR_ITEMS = [
  { key: 'subscription', label: 'My subscription', icon: 'Crown' },
  { key: 'orders', label: 'My Orders', icon: 'Package' },
  { key: 'invoice', label: 'Invoice', icon: 'FileText' },
  { key: 'referral', label: 'Referral', icon: 'Users' },
  { key: 'requests', label: 'Requests', icon: 'Send' },
  { key: 'payment', label: 'Payment Settings', icon: 'Wallet' },
  { key: 'refund', label: 'Refund Status', icon: 'RefreshCw' },
  { key: 'wishlist', label: 'My Wishlist', icon: 'Heart' },
]

export const CUSTOMER_MOBILE_MENU_ITEMS = [
  { key: 'subscription', label: 'My subscription' },
  { key: 'orders', label: 'My Orders' },
  { key: 'referral', label: 'Referrals' },
  { key: 'payment', label: 'Payment Settings' },
  { key: 'requests', label: 'Requests' },
  { key: 'wishlist', label: 'My wishlist' },
  { key: 'invoice', label: 'Payments & Invoice', subtitle: "You've an outstanding of Rs 1238.0" },
  { key: 'settings', label: 'Settings' },
]

export const CUSTOMER_COMPANY_INFO = {
  name: 'SBI mutual Fund',
  gstin: '12391270124701',
  pan: 'AREPK598776',
  location: 'Mumbai',
}

export const CUSTOMER_LEDGER_DATA = [
  { month: 'Oct 2021', rent: 20000, discount: 200, lateFee: 500, total: 20000, invoice: '123214124n', status: 'Unpaid', dueDate: '24th Nov, 2021' },
  { month: 'Oct 2021', rent: 20000, discount: 200, lateFee: 500, total: 20000, invoice: '123214124n', status: 'Paid', paidDate: '24th Nov, 2021' },
]

export const CUSTOMER_SUBSCRIPTION_DATA = [
  {
    id: 1,
    name: 'Dell Server DL 380',
    image: PRODUCT_IMAGES.poweredgeT30,
    quantity: 1,
    includes: 2,
    monthlyRent: 333135,
    tenure: '12 months',
    tenureLeft: '2 months',
    expiringSoon: false,
    subscribedOn: '16/11/21',
    currentDate: '6/11/22',
    expiringOn: '16/11/22',
    autoRenew: '8th Oct, 2020',
  },
  {
    id: 2,
    name: 'Dell Server DL 380',
    image: PRODUCT_IMAGES.poweredgeT30,
    quantity: 1,
    includes: 2,
    monthlyRent: 333135,
    tenure: '12 months',
    tenureLeft: '1 month',
    expiringSoon: true,
    subscribedOn: '16/11/21',
    currentDate: '6/11/22',
    expiringOn: '16/11/22',
    autoRenew: '8th Oct, 2020',
  },
  {
    id: 3,
    name: 'Dell Server DL 380',
    image: PRODUCT_IMAGES.poweredgeT30,
    quantity: 1,
    includes: 2,
    monthlyRent: 333135,
    tenure: '12 months',
    tenureLeft: '12 months',
    expiringSoon: false,
    subscribedOn: '16/11/21',
    currentDate: '6/11/22',
    expiringOn: '16/11/22',
  },
]

export const CUSTOMER_TRACK_ORDERS = [
  {
    id: 1,
    orderedDate: 'Monday, 29 March',
    salesRef: 'Santosh Agarwal',
    productName: 'PowerEdge T30 Mini Tower Server',
    productPrice: '₹3,000/month',
    trackingId: '2323948394874wt',
    address: 'Flat No 302, Nensey Society, Plot no.16, Bandra., Maharashtra - 400050',
    steps: [
      { label: 'Ordered Monday, 29 March', detail: 'Sales reference - Santosh Agarwal', done: true },
      { label: 'Shipped Wednesday, 1 April', detail: 'Asset arrived at Facility at GURUGRAM, Delhi at 2:00 AM wednesday, 1 April', done: false },
      { label: 'Out for delivery', detail: '', done: false },
      { label: 'Arriving Saturday', detail: '', done: false },
    ],
  },
]

export const CUSTOMER_ORDER_LIST_ITEMS = [
  { name: 'PowerEdge T30 Mini Tower Server', status: 'Out for delivery' },
  { name: 'PowerEdge T30 Mini Tower Server', status: 'Unshipped' },
  { name: 'PowerEdge T30 Mini Tower Server', status: 'Arriving today' },
]

export const CUSTOMER_PREVIOUS_ORDERS = [
  { item: 'PowerEdge T30 Mini Tower Server', serial: '323498245293875230', qty: '24 Mar 21', salesPerson: 'Santosh Agarwal', subscribedOn: '24 Mar 21', rentalPeriod: '19 Oct 2021- 19 Oct,2022', unitPrice: 'Rs 22900' },
  { item: 'PowerEdge T30 Mini Tower Server', serial: '', qty: '24 Mar 21', salesPerson: 'Santosh Agarwal', subscribedOn: '24 Mar 21', rentalPeriod: '19 Oct 2021- 19 Oct,2022', unitPrice: 'Rs 22900' },
  { item: 'PowerEdge T30 Mini Tower Server', serial: '323498245293875230', qty: '24 Mar 21', salesPerson: 'Santosh Agarwal', subscribedOn: '24 Mar 21', rentalPeriod: '19 Oct 2021- 19 Oct,2022', unitPrice: 'Rs 22900' },
]

export const CUSTOMER_INVOICES_DATA = [
  { period: '24 Mar 21– 24 Apr 21', amount: 'Rs 22900', id: 'RELKBKDHB' },
  { period: '24 Mar 21– 24 Apr 21', amount: 'Rs 22900', id: 'RELKBKDHB' },
  { period: '24 Mar 21– 24 Apr 21', amount: 'Rs 22900', id: 'RELKBKDHB' },
  { period: '24 Mar 21– 24 Apr 21', amount: 'Rs 22900', id: 'RELKBKDHB' },
]

export const CUSTOMER_PAYMENTS_DATA = [
  { date: '24 Mar 21', amount: 'Rs 22900' },
  { date: '24 Mar 21', amount: 'Rs 22900' },
  { date: '24 Mar 21', amount: 'Rs 22900' },
  { date: '24 Mar 21', amount: 'Rs 22900' },
]

export const CUSTOMER_CREDITS_DATA = [
  { date: '24 Mar 21', amount: 'Rs 22900' },
  { date: '24 Mar 21', amount: 'Rs 22900' },
  { date: '24 Mar 21', amount: 'Rs 22900' },
  { date: '24 Mar 21', amount: 'Rs 22900' },
]

export const CUSTOMER_REFUND_TRACK_STEPS = [
  { label: 'Return started Monday, 29 March', detail: 'Order No:#12352387328889', done: true },
  { label: 'Picked up, 30 March', detail: '', done: true },
  { label: 'Refund sent once we get the item, 30 March', detail: '', done: true },
  { label: 'Refund Successfull', detail: 'Refund credited to Axis Bank Debit Card ending in 2788', done: true },
]

export const CUSTOMER_REFUND_SUMMARY = {
  subtotal: 40000,
  discount: 2000,
  delivery: 5000,
  total: 33000,
  amount: 38000,
}
