import { PRODUCT_IMAGES } from './images'

// ─── Distributor-specific dashboard constants ───

export const DISTRIBUTOR_SIDEBAR_ITEMS = [
  { key: 'subscription', label: 'My Subscription', icon: 'Crown' },
  { key: 'orders', label: 'My Orders', icon: 'Package' },
  { key: 'clients', label: 'Clients', icon: 'Users' },
  { key: 'invoice', label: 'Invoice', icon: 'FileText' },
  { key: 'referral', label: 'Referral', icon: 'Star' },
  { key: 'requests', label: 'Requests', icon: 'Send' },
  { key: 'payment', label: 'Payment Settings', icon: 'CreditCard' },
  { key: 'refund', label: 'Refund Status', icon: 'RefreshCw' },
]

export const DISTRIBUTOR_COMPANY_INFO = {
  name: 'TechVista Distributors Pvt Ltd',
  gstin: '29AABCT1234B1Z5',
  pan: 'AABCT1234B',
  dealerRef: 'DLR-KA-0118',
}

export const DISTRIBUTOR_INVOICE_SUMMARY = {
  invoiceDate: '20th Nov',
  dueDate: '26/11/21',
  totalDue: 20000,
  lease: 85000,
  lateFee: 1200,
  interval: 0,
  totalAmr: 86200,
  datePeriod: '01 Nov - 30 Nov',
}

export const DISTRIBUTOR_PAYMENT_TABLE_DATA = [
  {
    id: 1,
    name: 'Dell Server DL 380 x3',
    rent: 45000,
    discount: 3500,
    tax: 7470,
    debitAmount: 48970,
    paymentMode: 'Auto Debit',
    status: 'Charged',
    paid: true,
  },
  {
    id: 2,
    name: 'HPE ProLiant DL360 x2',
    rent: 28000,
    discount: 2000,
    tax: 4680,
    debitAmount: 30680,
    paymentMode: 'Manual',
    status: 'Paid',
    paid: true,
  },
  {
    id: 3,
    name: 'Server Rack 42U x3',
    rent: 9000,
    discount: 0,
    tax: 1620,
    debitAmount: 10620,
    paymentMode: 'Auto Debit',
    status: 'Charged',
    paid: true,
  },
  {
    id: 4,
    name: 'APC Smart-UPS 3000VA x2',
    rent: 6000,
    discount: 500,
    tax: 990,
    debitAmount: 6490,
    paymentMode: 'Manual',
    status: 'Unpaid',
    paid: false,
  },
]

export const DISTRIBUTOR_SUBSCRIPTION_DATA = [
  {
    id: 1,
    brand: 'Dell',
    model: 'Server DL 380',
    image: PRODUCT_IMAGES.poweredgeT30,
    description: 'PowerEdge, 128GB RAM, Dual Xeon Gold',
    startDate: '01/01/2025',
    endDate: '31/12/2026',
    expiringOn: '31/12/2026',
    assetType: 'Server',
    status: 'Active',
    tenure: '24 Months',
    monthlyRent: 15000,
    serial: 'DL380-SRV-001',
    qty: 3,
    itemId: 'RENTR-IT-001',
    progress: 50,
  },
  {
    id: 2,
    brand: 'HPE',
    model: 'ProLiant DL360',
    image: PRODUCT_IMAGES.poweredgeT30,
    description: 'ProLiant DL360 Gen10 Plus, 64GB, Xeon Silver',
    startDate: '15/03/2025',
    endDate: '14/03/2027',
    expiringOn: '14/03/2027',
    assetType: 'Server',
    status: 'Active',
    tenure: '24 Months',
    monthlyRent: 14000,
    serial: 'HPE-DL360-002',
    qty: 2,
    itemId: 'RENTR-IT-002',
    progress: 35,
  },
  {
    id: 3,
    brand: 'Dell',
    model: 'Server Rack 42U',
    image: PRODUCT_IMAGES.inspiron245000,
    description: '42U Standard Rack, Cable Management, PDU',
    startDate: '01/01/2025',
    endDate: '31/12/2025',
    expiringOn: '31/12/2025',
    assetType: 'Rack',
    status: 'Expired',
    tenure: '12 Months',
    monthlyRent: 3000,
    serial: 'RACK-42U-003',
    qty: 3,
    itemId: 'RENTR-IT-003',
    progress: 100,
  },
]

export const DISTRIBUTOR_LEDGER_DATA = [
  { month: 'Nov 2025', rent: 86200, discount: 3500, lateFee: 1200, total: 83900, invoice: 'INV-D-1101', status: 'Unpaid' },
  { month: 'Oct 2025', rent: 86200, discount: 5000, lateFee: 0, total: 81200, invoice: 'INV-D-1001', status: 'Paid' },
  { month: 'Sep 2025', rent: 86200, discount: 5000, lateFee: 0, total: 81200, invoice: 'INV-D-0901', status: 'Paid' },
  { month: 'Aug 2025', rent: 86200, discount: 0, lateFee: 0, total: 86200, invoice: 'INV-D-0801', status: 'Paid' },
]

export const DISTRIBUTOR_SUPPORT_TICKETS = [
  { item: 'Dell Server DL 380', client: 'TechVista Distributors', createdBy: 'Rajesh Patel', createdOn: '20/11/2025', status: 'Open', assignedTo: 'Rahul S.', refund: '-' },
  { item: 'HPE ProLiant DL360', client: 'TechVista Distributors', createdBy: 'Rajesh Patel', createdOn: '15/10/2025', status: 'Resolved', assignedTo: 'Priya M.', refund: '₹1,500' },
]

export const DISTRIBUTOR_TRACK_ORDERS = [
  {
    item: 'Dell Server DL 380',
    qty: 3,
    salesPerson: 'Amit K.',
    rentalPeriod: '24 Months',
    unitPrice: 15000,
    status: 'In Transit',
    image: PRODUCT_IMAGES.poweredgeT30,
    orderedOn: '15/11/2025',
    shippedOn: '18/11/2025',
    shippedFrom: 'Mumbai Warehouse',
    outForDelivery: '20/11/2025',
    arriving: '22/11/2025',
    trackingId: 'RNTR-TRK-78234',
    shippedAddress: '402, Business Park, Whitefield, Bangalore - 560066',
    orderInfo: 'ORD-2025-1101',
  },
  {
    item: 'APC Smart-UPS 3000VA',
    qty: 2,
    salesPerson: 'Amit K.',
    rentalPeriod: '12 Months',
    unitPrice: 3000,
    status: 'Processing',
    image: PRODUCT_IMAGES.poweredgeT30,
    orderedOn: '20/11/2025',
    shippedOn: null,
    shippedFrom: null,
    outForDelivery: null,
    arriving: '28/11/2025',
    trackingId: 'RNTR-TRK-78235',
    shippedAddress: '402, Business Park, Whitefield, Bangalore - 560066',
    orderInfo: 'ORD-2025-1102',
  },
]

export const DISTRIBUTOR_PREVIOUS_ORDERS = [
  { item: 'Dell PowerEdge R740', qty: 5, salesPerson: 'Ravi P.', subscribedOn: '10/01/2024', rentalPeriod: '12 Months', unitPrice: 12000 },
  { item: 'Cisco Catalyst Switch', qty: 4, salesPerson: 'Ravi P.', subscribedOn: '10/01/2024', rentalPeriod: '12 Months', unitPrice: 4500 },
]

export const DISTRIBUTOR_INVOICES_DATA = [
  { company: 'SBI Mutual Fund', companyId: 'CLT-001', item: 'Dell Latitude 5540', startDate: '01/11/2025', endDate: '30/11/2025', amount: 83900, id: 'INV-D-1101' },
  { company: 'Reliance Industries', companyId: 'CLT-002', item: 'Dell Server DL 380', startDate: '01/10/2025', endDate: '31/10/2025', amount: 81200, id: 'INV-D-1001' },
  { company: 'TCS Ltd', companyId: 'CLT-003', item: 'HP E24 Monitor', startDate: '01/09/2025', endDate: '30/09/2025', amount: 81200, id: 'INV-D-0901' },
]

export const DISTRIBUTOR_PAYMENTS_DATA = [
  { date: '05/10/2025', amount: 81200 },
  { date: '03/09/2025', amount: 81200 },
  { date: '05/08/2025', amount: 86200 },
]

export const DISTRIBUTOR_CREDITS_DATA = [
  { date: '20/11/2025', amount: 1500 },
  { date: '15/09/2025', amount: 3000 },
]

export const DISTRIBUTOR_REFUND_TRACK_DATA = [
  {
    item: 'Server Rack 42U',
    qty: 1,
    image: PRODUCT_IMAGES.inspiron245000,
    refundAmount: 8500,
    status: 'Return Initiated',
    steps: [
      { label: 'Return Requested', date: '15/11/2025', done: true },
      { label: 'Pickup Scheduled', date: '18/11/2025', done: true },
      { label: 'Item Received', date: null, done: false },
      { label: 'Refund Processed', date: null, done: false },
    ],
  },
  {
    item: 'APC Smart-UPS 1500VA',
    qty: 2,
    image: PRODUCT_IMAGES.poweredgeT30,
    refundAmount: 4200,
    status: 'Refund Processed',
    steps: [
      { label: 'Return Requested', date: '01/10/2025', done: true },
      { label: 'Pickup Completed', date: '05/10/2025', done: true },
      { label: 'Item Received', date: '08/10/2025', done: true },
      { label: 'Refund Processed', date: '12/10/2025', done: true },
    ],
  },
]

export const DISTRIBUTOR_SAVED_CARDS = [
  { id: 1, type: 'Visa', last4: '7892', expiry: '08/27', name: 'TechVista Distributors' },
  { id: 2, type: 'RuPay', last4: '3345', expiry: '03/26', name: 'TechVista Distributors' },
]

export const DISTRIBUTOR_CLIENT_LIST = [
  { id: 'CLT-001', name: 'SBI Mutual Fund', contact: 'John Doe', phone: '+91 98765 43210', email: 'john@sbi.com', activeAssets: 12, status: 'Active', item: 'Dell Latitude 5540', itemId: 'RENTR-IT-010', startDate: '01/01/2025', endDate: '31/12/2025', invoice: 'INV-C-0101', paymentAmount: 12500, paymentStatus: 'PAID' },
  { id: 'CLT-002', name: 'Reliance Industries', contact: 'Priya Sharma', phone: '+91 98123 45678', email: 'priya@ril.com', activeAssets: 8, status: 'Active', item: 'Dell Server DL 380', itemId: 'RENTR-IT-001', startDate: '15/03/2025', endDate: '14/03/2027', invoice: 'INV-C-0302', paymentAmount: 30000, paymentStatus: 'PENDING' },
  { id: 'CLT-003', name: 'TCS Ltd', contact: 'Amit Verma', phone: '+91 99001 22334', email: 'amit@tcs.com', activeAssets: 5, status: 'Inactive', item: 'HP E24 Monitor', itemId: 'RENTR-IT-015', startDate: '01/06/2025', endDate: '31/05/2026', invoice: 'INV-C-0603', paymentAmount: 4000, paymentStatus: 'PENDING' },
]

export const DISTRIBUTOR_CLIENT_SUBSCRIPTIONS = [
  { client: 'SBI Mutual Fund', item: 'Dell Latitude 5540', qty: 5, tenure: '12 Months', monthlyRent: 2500, startDate: '01/01/2025', status: 'Active' },
  { client: 'SBI Mutual Fund', item: 'HP E24 Monitor', qty: 5, tenure: '12 Months', monthlyRent: 800, startDate: '01/01/2025', status: 'Active' },
  { client: 'Reliance Industries', item: 'Dell Server DL 380', qty: 2, tenure: '24 Months', monthlyRent: 15000, startDate: '15/03/2025', status: 'Active' },
]

export const DISTRIBUTOR_STATUS_BADGE = {
  Charged: 'bg-blue-100 text-blue-700',
  Paid: 'bg-green-50 text-green-600',
  PAID: 'bg-green-50 text-green-600',
  Unpaid: 'bg-red-100 text-red-700',
  PENDING: 'bg-orange-50 text-orange-600',
  Active: 'bg-green-50 text-green-600',
  Inactive: 'bg-gray-100 text-gray-500',
  Expired: 'bg-red-50 text-red-500',
  'Expiring Soon': 'bg-orange-100 text-orange-700',
  'Pickup Scheduled': 'bg-orange-100 text-orange-700',
  Open: 'bg-orange-100 text-orange-700',
  Resolved: 'bg-green-100 text-green-700',
  'In Transit': 'bg-blue-100 text-blue-700',
  Processing: 'bg-yellow-100 text-yellow-700',
  'Return Initiated': 'bg-orange-100 text-orange-700',
  'Refund Processed': 'bg-green-100 text-green-700',
}
