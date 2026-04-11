import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { saleorOrders } from '../../services/saleor'
import { handleImgError } from '../../constants/images'
// Demo mode: using mock data from constants
import {
  Crown,
  Package,
  FileText,
  Users,
  Send,
  CreditCard,
  RefreshCw,
  ChevronRight,
  Download,
  Star,
  Phone,
  CalendarDays,
  CheckCircle,
  Circle,
  Wallet,
  MapPin,
} from 'lucide-react'

import {
  CUSTOMER_COMPANY_INFO as COMPANY_INFO,
  CUSTOMER_LEDGER_DATA as LEDGER_DATA,
  CUSTOMER_SUBSCRIPTION_DATA as SUBSCRIPTION_DATA,
  CUSTOMER_TRACK_ORDERS as TRACK_ORDERS,
  CUSTOMER_ORDER_LIST_ITEMS as ORDER_LIST_ITEMS,
  CUSTOMER_PREVIOUS_ORDERS as PREVIOUS_ORDERS,
  CUSTOMER_INVOICES_DATA as INVOICES_DATA,
  CUSTOMER_PAYMENTS_DATA as PAYMENTS_DATA,
  CUSTOMER_CREDITS_DATA as CREDITS_DATA,
  SUPPORT_TICKETS_CUSTOMER as SUPPORT_TICKETS,
  SAVED_CARDS_CUSTOMER as SAVED_CARDS,
  CUSTOMER_REFUND_TRACK_STEPS as REFUND_TRACK_STEPS,
  CUSTOMER_REFUND_SUMMARY as REFUND_SUMMARY,
  CUSTOMER_MOBILE_MENU_ITEMS as MOBILE_MENU_ITEMS,
} from '../../constants/dashboard'

import DashboardSidebar from '../../components/modules/dashboard/DashboardSidebar'
import MobileBackHeader from '../../components/modules/dashboard/MobileBackHeader'
import SubTabs from '../../components/modules/dashboard/SubTabs'
import PaymentPendingCard from '../../components/modules/dashboard/PaymentPendingCard'
import SubscriptionCard from '../../components/modules/dashboard/SubscriptionCard'
import OrderTracking from '../../components/modules/dashboard/OrderTracking'
import InvoiceTable from '../../components/modules/dashboard/InvoiceTable'
import SupportTickets from '../../components/modules/dashboard/SupportTickets'
import ReferralSection from '../../components/modules/dashboard/ReferralSection'
import SavedCards from '../../components/modules/dashboard/SavedCards'
import RefundTracking from '../../components/modules/dashboard/RefundTracking'
import SupportModal from '../../components/modules/dashboard/SupportModal'
import CancelModal from '../../components/modules/dashboard/CancelModal'

// ─── Sidebar Items (with actual icon components) ───
const SIDEBAR_ITEMS = [
  { key: 'subscription', label: 'My subscription', icon: Crown },
  { key: 'orders', label: 'My Orders', icon: Package },
  { key: 'invoice', label: 'Invoice', icon: FileText },
  { key: 'referral', label: 'Referral', icon: Users },
  { key: 'requests', label: 'Requests', icon: Send },
  { key: 'payment', label: 'Payment Settings', icon: Wallet },
  { key: 'refund', label: 'Refund Status', icon: RefreshCw },
]

// ─── Component ───
export default function CustomerDashboard() {
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState('subscription')
  const [mobileView, setMobileView] = useState(null)
  const [subTab, setSubTab] = useState('ledger')
  const [orderSubTab, setOrderSubTab] = useState('track')
  const [mobileTrackingOrder, setMobileTrackingOrder] = useState(null)
  const [invoiceSubTab, setInvoiceSubTab] = useState('invoices')
  const [refundSubTab, setRefundSubTab] = useState('track')
  const [referralEmail, setReferralEmail] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [paymentView, setPaymentView] = useState('main')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cancelReasons, setCancelReasons] = useState([])
  const [cancelDate, setCancelDate] = useState('1 May ,2020')
  const [cancelForm, setCancelForm] = useState({
    collectionBy: '', contactNumber: '', email: '', trackingId: '', paymentId: '', deliveryTime: '',
  })
  const [supportForm, setSupportForm] = useState({
    asset: '', serial: '', address: 'Flat No 302, Nensey Society, Plot no.16, Bandra., Maharashtra - 400050',
    mobile: '+91 9870200089', issues: [], query: '',
  })

  const displayName = user?.full_name || 'Santosh'

  // Fetch orders from Saleor
  const [apiOrders, setApiOrders] = useState([])

  useEffect(() => {
    if (token) {
      saleorOrders.getMyOrders(token)
        .then(result => setApiOrders(result.orders))
        .catch(err => console.error('[Saleor] Failed to fetch orders:', err))
    }
  }, [token])

  const copyReferralCode = () => {
    navigator.clipboard?.writeText('RENTRRFFRL')
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const toggleCancelReason = (reason) => {
    setCancelReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    )
  }

  const toggleIssue = (issue) => {
    setSupportForm(prev => ({
      ...prev,
      issues: prev.issues.includes(issue) ? prev.issues.filter(i => i !== issue) : [...prev.issues, issue],
    }))
  }

  const handleMobileNav = (key) => {
    setMobileView(key)
    setActiveTab(key)
    if (key === 'subscription') setSubTab('ledger')
    if (key === 'orders') setOrderSubTab('track')
    if (key === 'invoice') setInvoiceSubTab('invoices')
    if (key === 'refund') setRefundSubTab('track')
    if (key === 'payment') setPaymentView('main')
  }

  const handleSidebarTabChange = (key) => {
    setActiveTab(key)
    if (key === 'subscription') setSubTab('ledger')
    if (key === 'orders') setOrderSubTab('track')
    if (key === 'invoice') setInvoiceSubTab('invoices')
    if (key === 'refund') setRefundSubTab('track')
    if (key === 'payment') setPaymentView('main')
  }

  const handleSidebarTabChangeMobile = (key) => {
    setActiveTab(key)
    setMobileView(key)
    if (key === 'subscription') setSubTab('ledger')
    if (key === 'orders') setOrderSubTab('track')
    if (key === 'invoice') setInvoiceSubTab('invoices')
    if (key === 'refund') setRefundSubTab('track')
    if (key === 'payment') setPaymentView('main')
  }

  // ─── Subscription Progress Bar ───
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

  // ═══════════════════════════════════════
  // MOBILE ACCOUNT LANDING PAGE
  // ═══════════════════════════════════════

  const renderMobileAccountLanding = () => (
    <div className="lg:hidden min-h-screen bg-[#f0f0f0]">
      <div className="bg-dark text-white text-center py-8 px-4">
        <h2 className="font-heading text-lg font-bold">Hello {displayName}</h2>
        <div className="flex items-center justify-center gap-1.5 mt-2 text-white/80">
          <MapPin size={14} />
          <span className="text-sm">{(user?.city || COMPANY_INFO.location)}</span>
        </div>
      </div>

      <div className="bg-white px-5 py-5 border-b border-gray-200">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-bold text-gray-1">Company name</span>
            <span className="text-sm text-gray-3">{(user?.company_name || COMPANY_INFO.name)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-bold text-gray-1">GSTIN/UIN</span>
            <span className="text-sm text-gray-3">{(user?.gst_no || COMPANY_INFO.gstin)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-bold text-gray-1">Company Pan</span>
            <span className="text-sm text-gray-3">{(user?.company_pan || COMPANY_INFO.pan)}</span>
          </div>
        </div>
      </div>

      <div className="mt-1">
        {MOBILE_MENU_ITEMS.map((item, idx) => (
          <button
            key={item.key}
            onClick={() => handleMobileNav(item.key)}
            className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors cursor-pointer ${
              idx % 2 === 0 ? 'bg-[#f0f0f0]' : 'bg-white'
            }`}
          >
            <div>
              <span className="text-sm font-medium text-gray-1">{item.label}</span>
              {item.subtitle && (
                <p className="text-xs text-gray-3 mt-0.5">{item.subtitle}</p>
              )}
            </div>
            <ChevronRight size={18} className="text-gray-3 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )

  // ═══════════════════════════════════════
  // SUBSCRIPTION TAB
  // ═══════════════════════════════════════

  const renderSubscriptionLedger = () => (
    <div>
      <div className="hidden sm:block bg-[#fcfcfc] border border-gray-200 rounded-2xl shadow-[0_0_45px_rgba(0,0,0,0.02)] p-6 mb-6">
        <div className="flex flex-wrap items-end gap-8">
          <div>
            <p className="text-xs text-gray-2 uppercase font-medium mb-8">Rental due</p>
            <p className="text-2xl font-medium text-gray-2">₹ 25,000</p>
          </div>
          <p className="text-2xl font-bold text-gray-3 pb-0.5">+</p>
          <div>
            <p className="text-xs text-gray-2 uppercase font-medium mb-8">Late Fee</p>
            <p className="text-2xl font-medium text-gray-2">₹ 500</p>
          </div>
          <p className="text-2xl font-bold text-gray-3 pb-0.5">-</p>
          <div>
            <p className="text-xs text-gray-2 uppercase font-medium mb-8">Refund</p>
            <p className="text-2xl font-medium text-gray-2">₹ 0</p>
          </div>
          <p className="text-2xl font-bold text-black pb-0.5">=</p>
          <div>
            <p className="text-xs text-gray-1 uppercase font-extrabold mb-6">Total Due</p>
            <p className="text-gray-1"><span className="text-2xl font-bold">₹ </span><span className="text-4xl font-bold">20,000</span></p>
          </div>
        </div>
      </div>

      <div className="sm:hidden bg-[#fcfcfc] border border-gray-200 rounded-xl p-5 mb-6">
        <h4 className="font-heading text-base font-bold text-gray-1 mb-4">Summary</h4>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-3">Rental due</span>
            <span className="text-gray-1">Rs 100</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-3">Refund</span>
            <span className="text-gray-1">Rs 100</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-3">Late fees</span>
            <span className="text-gray-1">Rs 100</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-gray-300 pt-3">
            <span className="text-gray-1">Total amount</span>
            <span className="text-gray-1">Rs 100</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f8f8f8] border-y border-gray-300">
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Month</th>
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Rent</th>
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase hidden sm:table-cell">Discount</th>
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase hidden sm:table-cell">Late fee</th>
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Total</th>
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase hidden md:table-cell">Invoice</th>
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {LEDGER_DATA.map((row, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="px-4 sm:px-6 py-4 text-gray-1">{row.month}</td>
                <td className="px-4 sm:px-6 py-4 text-gray-1">₹{row.rent.toLocaleString()}</td>
                <td className="px-4 sm:px-6 py-4 text-gray-1 hidden sm:table-cell">₹{row.discount}</td>
                <td className="px-4 sm:px-6 py-4 text-gray-1 hidden sm:table-cell">₹{row.lateFee}</td>
                <td className="px-4 sm:px-6 py-4 text-gray-1">₹{row.total.toLocaleString()}</td>
                <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                  <span className="text-gray-1">{row.invoice}</span>
                  <button className="ml-2 text-gray-3 hover:text-primary cursor-pointer"><Download size={14} /></button>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <span className={`font-medium text-xs sm:text-sm ${row.status === 'Unpaid' ? 'text-[#eb5757]' : 'text-[#219653]'}`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderRefundSummary = () => (
    <div className="bg-[#fcfcfc] border border-gray-200 rounded-xl p-5">
      <h4 className="font-heading text-base sm:text-lg font-bold text-gray-1 mb-1">Refund Summary</h4>
      <div className="w-8 h-0.5 bg-primary mb-3" />
      <p className="text-sm text-gray-1 mb-4">
        <span className="font-bold">Rs {REFUND_SUMMARY.amount.toLocaleString()}</span> will be sent to your payment card/wallet
      </p>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-3">Refund Subtotal for 3 items</span>
          <span className="text-gray-1">₹{REFUND_SUMMARY.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-3">Discount deduction</span>
          <span className="text-gray-1">- ₹{REFUND_SUMMARY.discount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-3">Delivery deduction</span>
          <span className="text-gray-1">- ₹{REFUND_SUMMARY.delivery.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-t border-gray-300 pt-3 font-semibold">
          <span className="text-gray-1">Total expected refund</span>
          <span className="text-gray-1">₹{REFUND_SUMMARY.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )

  // ═══════════════════════════════════════
  // ORDERS TAB
  // ═══════════════════════════════════════

  const renderOrders = () => (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <SubTabs
          tabs={[{ key: 'track', label: 'Track Order' }, { key: 'previous', label: 'Previous Order' }]}
          active={orderSubTab}
          onChange={(key) => { setOrderSubTab(key); setMobileTrackingOrder(null) }}
        />
      </div>

      {orderSubTab === 'track' ? (
        <OrderTracking
          variant="customer"
          trackOrders={TRACK_ORDERS}
          orderListItems={ORDER_LIST_ITEMS}
          mobileTrackingOrder={mobileTrackingOrder}
          setMobileTrackingOrder={setMobileTrackingOrder}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8f8f8] border-y border-gray-300">
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Item</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase hidden sm:table-cell">Sales Person</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase hidden md:table-cell">Rental Period</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Unit Price</th>
              </tr>
            </thead>
            <tbody>
              {(apiOrders.length > 0 ? apiOrders.map(o => ({
                item: `Order #${o.id}`,
                salesPerson: '-',
                rentalPeriod: `${o.rental_months} months`,
                unitPrice: `₹${o.total_amount?.toLocaleString('en-IN')}`,
              })) : PREVIOUS_ORDERS).map((o, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="px-4 sm:px-6 py-4">
                    <p className="text-gray-1 font-medium">{o.item}</p>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-gray-1 hidden sm:table-cell">{o.salesPerson}</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-1 hidden md:table-cell">{o.rentalPeriod}</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-1">{o.unitPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // ═══════════════════════════════════════
  // INVOICE TAB
  // ═══════════════════════════════════════

  const renderInvoice = () => (
    <div>
      <SubTabs tabs={[{ key: 'invoices', label: 'Invoices' }, { key: 'payments', label: 'Payments' }, { key: 'credits', label: 'Credits' }]}
        active={invoiceSubTab} onChange={setInvoiceSubTab} />
      <InvoiceTable
        variant="customer"
        invoiceSubTab={invoiceSubTab}
        invoicesData={INVOICES_DATA}
        paymentsData={PAYMENTS_DATA}
        creditsData={CREDITS_DATA}
      />
    </div>
  )

  // ═══════════════════════════════════════
  // REFERRAL TAB
  // ═══════════════════════════════════════

  const renderReferral = () => (
    <ReferralSection
      variant="customer"
      referralEmail={referralEmail}
      setReferralEmail={setReferralEmail}
      codeCopied={codeCopied}
      copyReferralCode={copyReferralCode}
    />
  )

  // ═══════════════════════════════════════
  // REQUESTS TAB
  // ═══════════════════════════════════════

  const renderRequests = () => (
    <div className="space-y-6">
      {[
        { title: 'Support Request', desc: 'Having a problem? Rentr offers a warranty program to its customers which takes care of most damages. If you are covered under rental agreement, you can raise a support request and we will replace or repair those assets and help you out.', actions: [{ label: 'Past Requests', variant: 'outline' }, { label: 'New Request', variant: 'primary', onClick: () => setShowSupportModal(true) }] },
        { title: 'Partial Return', desc: 'If you want to return some assets/products, please give a 15 days prior notice, settle your dues if any, and we will arrange for the pick up to be competed', actions: [{ label: 'New Request', variant: 'primary' }] },
        { title: 'Renewal / Extend Subscription', desc: 'If you want to renew subscription and extend tenure for purchased assets/products, Your current membership will continue until April 18, 2021 after which you will be charged as per the updated plan', actions: [{ label: 'New Request', variant: 'primary', onClick: () => setShowExtendModal(true) }] },
        { title: 'Cancel Subscription', desc: 'In case of early termination of your subscription, we provide a smooth and hassle-free account termination process. you can request for closure by informing us 15 days prior to the selected preferred date, settle your dues if any, and we\'ll arrange for the pickup to be completed.', actions: [{ label: 'New Request', variant: 'primary', onClick: () => setShowCancelModal(true) }] },
      ].map((section) => (
        <div key={section.title} className="bg-[#fcfcfc] border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="font-heading text-base sm:text-lg font-bold text-gray-1">{section.title}</h3>
          <p className="text-sm text-gray-3 mt-2">{section.desc}</p>
          <div className="flex flex-wrap gap-3 mt-4">
            {section.actions.map((action) => (
              <button key={action.label} onClick={action.onClick}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  action.variant === 'primary'
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'border border-gray-1 text-gray-1 hover:bg-gray-50'
                }`}>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  // ═══════════════════════════════════════
  // PAYMENT SETTINGS TAB
  // ═══════════════════════════════════════

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      {paymentView === 'main' ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="font-heading text-xl font-bold text-gray-1 uppercase tracking-wide">Auto Debit</h2>
            <p className="text-gray-3 text-sm">Total amount <span className="font-heading text-2xl font-bold text-gray-1 ml-2">₹ 2000/-</span></p>
          </div>
          <p className="text-sm text-gray-3">Choose to pay via Auto Debit for hassle-free payment experience.</p>
          <SavedCards cards={SAVED_CARDS} variant="customer" onAddPayment={() => setPaymentView('add')} />
        </>
      ) : (
        <>
          <h2 className="font-heading text-xl font-bold text-gray-1 uppercase tracking-wide">Turn on Auto Debit</h2>
          <div className="border border-gray-300 rounded-lg p-4 sm:p-6">
            <h3 className="font-heading text-base font-bold text-gray-1">Select Payment Method</h3>
            <div className="w-10 h-0.5 bg-primary mt-1 mb-1" />
            <p className="text-xs text-gray-3 mb-6">Step 1 of 2</p>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-64 space-y-4">
                {['Credit / Debit Card', 'Netbanking', 'UPI', 'Wallets'].map((method) => (
                  <label key={method} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="paymentMethod" checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)} className="w-4 h-4 accent-primary" />
                    <span className={`text-sm ${paymentMethod === method ? 'text-primary font-medium' : 'text-gray-1'}`}>{method}</span>
                  </label>
                ))}
              </div>
              {paymentMethod === 'Credit / Debit Card' && (
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm text-gray-1 mb-1.5">Card Number</label>
                    <div className="relative">
                      <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-3" />
                      <input type="text" placeholder="0000-0000-0000-0000" className="input-field-rect pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-1 mb-1.5">Card holder's Name</label>
                    <input type="text" placeholder="Enter card holder name" className="input-field-rect" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-1 mb-1.5">Expiry Date</label>
                      <input type="text" placeholder="MM/YY" className="input-field-rect" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-1 mb-1.5">CVV</label>
                      <input type="password" placeholder="•••" className="input-field-rect" />
                    </div>
                  </div>
                  <button className="bg-[#219653] text-white px-8 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 transition-colors">Pay now</button>
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setPaymentView('main')}
            className="text-sm text-gray-3 hover:text-gray-1 flex items-center gap-1 transition-colors cursor-pointer">
            <ChevronRight size={14} className="rotate-180" /> Back to Payment Settings
          </button>
        </>
      )}
    </div>
  )

  // ═══════════════════════════════════════
  // REFUND STATUS TAB
  // ═══════════════════════════════════════

  const renderRefundStatus = () => (
    <div>
      <SubTabs tabs={[{ key: 'track', label: 'Track Return and Refund' }, { key: 'credits', label: 'Credits' }]}
        active={refundSubTab} onChange={setRefundSubTab} />

      {refundSubTab === 'track' ? (
        <RefundTracking
          variant="customer"
          refundSteps={REFUND_TRACK_STEPS}
          refundSummary={REFUND_SUMMARY}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#f8f8f8] border-y border-gray-300">
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Date</th>
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Amount</th>
            </tr></thead>
            <tbody>
              {CREDITS_DATA.map((c, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="px-4 sm:px-6 py-4 text-gray-1">{c.date}</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-1">{c.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // ═══════════════════════════════════════
  // TAB CONTENT MAPPING
  // ═══════════════════════════════════════

  const renderTabContent = () => {
    const mobileBackHandler = () => setMobileView(null)

    switch (activeTab) {
      case 'subscription':
        return (
          <div>
            <MobileBackHeader title="My subscription" onBack={mobileBackHandler} />
            <div className="flex-1">
              <div className="mb-4">
                <h2 className="font-heading text-lg sm:text-xl font-bold text-gray-1">Hi {displayName}</h2>
                <p className="text-xs sm:text-sm text-gray-3 mt-1">Here are quick updates for you</p>
              </div>
              <PaymentPendingCard />
              <div className="hidden lg:block space-y-4 text-[15px] mb-6">
                <div className="flex gap-4">
                  <span className="font-heading font-medium text-black w-40">Company name</span>
                  <span className="text-gray-3 font-medium">{(user?.company_name || COMPANY_INFO.name)}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-heading font-medium text-black w-40">GSTIN/UIN</span>
                  <span className="text-gray-3 font-medium">{(user?.gst_no || COMPANY_INFO.gstin)}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-heading font-medium text-black w-40">Company Pan</span>
                  <span className="text-gray-3 font-medium">{(user?.company_pan || COMPANY_INFO.pan)}</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex flex-wrap gap-2 mb-6">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-1 hover:bg-gray-50 transition-colors cursor-pointer">
                <Star size={12} className="text-primary" /> Extend Subscription <ChevronRight size={12} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-1 hover:bg-gray-50 transition-colors cursor-pointer">
                <Phone size={12} className="text-gray-3" /> Support Request <ChevronRight size={12} />
              </button>
              <button onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-[#eb5757] hover:bg-red-50 transition-colors cursor-pointer">
                Cancel Subscription
              </button>
            </div>
            <div className="bg-[#fcfcfc] border border-gray-200 rounded-2xl shadow-[0_0_45px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="px-4 sm:px-6 pt-6">
                <SubTabs
                  tabs={[{ key: 'ledger', label: 'Ledger' }, { key: 'details', label: 'Subscription details' }, { key: 'refund', label: 'Refund' }, { key: 'support', label: 'Support tickets' }]}
                  active={subTab} onChange={setSubTab}
                />
              </div>
              <div className="px-4 sm:px-6 pb-6">
                {subTab === 'ledger' && renderSubscriptionLedger()}
                {subTab === 'details' && <SubscriptionCard data={SUBSCRIPTION_DATA} variant="customer" />}
                {subTab === 'refund' && renderRefundSummary()}
                {subTab === 'support' && <SupportTickets tickets={SUPPORT_TICKETS} variant="customer" />}
              </div>
            </div>
          </div>
        )
      case 'orders':
        return <div><MobileBackHeader title="My Orders" onBack={mobileBackHandler} />{renderOrders()}</div>
      case 'invoice':
        return <div><MobileBackHeader title="Payments & Invoice" onBack={mobileBackHandler} />{renderInvoice()}</div>
      case 'referral':
        return <div><MobileBackHeader title="Referrals" onBack={mobileBackHandler} />{renderReferral()}</div>
      case 'requests':
        return <div><MobileBackHeader title="Account" onBack={mobileBackHandler} />{renderRequests()}</div>
      case 'payment':
        return <div><MobileBackHeader title="Payment Settings" onBack={mobileBackHandler} />{renderPaymentSettings()}</div>
      case 'refund':
        return <div><MobileBackHeader title="Refund Status" onBack={mobileBackHandler} />{renderRefundStatus()}</div>
      default:
        return null
    }
  }

  // ═══════════════════════════════════════
  // EXTEND MODAL (Customer-specific)
  // ═══════════════════════════════════════

  const renderExtendModal = () => (
    showExtendModal && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="p-5 sm:p-6">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-gray-1 mb-4">Renew / extend subscription</h3>
            <div className="flex gap-4 mb-4">
              <button className="text-sm font-semibold text-gray-1 border-b-2 border-gray-1 pb-1">ACTIVE</button>
              <button className="text-sm font-medium text-gray-3 pb-1">EXPIRED</button>
            </div>
            <p className="text-sm text-gray-1 mb-4">Select one or more Asset</p>
            <div className="space-y-6">
              {SUBSCRIPTION_DATA.map((asset) => (
                <div key={asset.id} className="flex flex-col md:flex-row gap-4 border border-gray-300 rounded-lg p-4">
                  <div className="w-full md:w-40 h-32 bg-gray-50 rounded flex items-center justify-center shrink-0 overflow-hidden p-3">
                    <img src={asset.image} alt={asset.name} className="max-h-full max-w-full object-contain" onError={handleImgError} loading="lazy" />
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row md:justify-between gap-4">
                    <div>
                      <h4 className="font-heading text-base font-bold text-gray-1">{asset.name}</h4>
                      <p className="text-sm text-gray-3 mt-1">Quantity : {asset.quantity}  (Includes {asset.includes} items)</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <CreditCard size={14} className="text-gray-3" />
                          <span className="text-gray-3">Monthly Rent:</span>
                          <span className="text-gray-1">₹{asset.monthlyRent.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarDays size={14} className="text-gray-3" />
                          <span className="text-gray-3">Tenure left</span>
                          <span className={asset.expiringSoon ? 'text-[#eb5757]' : 'text-gray-1'}>
                            {asset.tenureLeft} {asset.expiringSoon && <span className="text-[#eb5757]">(Expiring Soon)</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-3">
                      <SubscriptionProgress subscribedOn={asset.subscribedOn} currentDate={asset.currentDate} expiringOn={asset.expiringOn} />
                      <button className="mt-1 px-5 py-1.5 rounded-full border border-gray-1 text-sm font-medium text-gray-1 hover:bg-gray-50 transition-colors flex items-center gap-1 cursor-pointer">
                        {asset.id === 1 ? <CheckCircle size={14} className="text-primary" /> : <Circle size={14} className="text-gray-3" />}
                        Extend
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6 justify-center">
              <button className="bg-primary text-white px-8 py-2.5 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors">Place request</button>
              <button onClick={() => setShowExtendModal(false)}
                className="px-8 py-2.5 rounded-full border border-gray-300 text-sm font-medium text-gray-1 hover:bg-gray-50 transition-colors cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      </div>
    )
  )

  // ═══════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════

  return (
    <div className="bg-[#f8f8f9] min-h-screen">
      {mobileView === null ? (
        <>
          {renderMobileAccountLanding()}
          <div className="hidden lg:flex">
            <DashboardSidebar items={SIDEBAR_ITEMS} activeTab={activeTab} onTabChange={handleSidebarTabChange} variant="customer" />
            <main className="flex-1 min-w-0 px-8 lg:px-12 py-8">{renderTabContent()}</main>
          </div>
        </>
      ) : (
        <>
          <div className="lg:hidden">
            <main className="px-4 sm:px-6 py-6">{renderTabContent()}</main>
          </div>
          <div className="hidden lg:flex">
            <DashboardSidebar items={SIDEBAR_ITEMS} activeTab={activeTab} onTabChange={handleSidebarTabChangeMobile} variant="customer" />
            <main className="flex-1 min-w-0 px-8 lg:px-12 py-8">{renderTabContent()}</main>
          </div>
        </>
      )}
      <CancelModal
        variant="customer"
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        cancelReasons={cancelReasons}
        toggleCancelReason={toggleCancelReason}
        subscriptionData={SUBSCRIPTION_DATA}
        cancelDate={cancelDate}
        setCancelDate={setCancelDate}
        cancelForm={cancelForm}
        setCancelForm={setCancelForm}
      />
      <SupportModal
        variant="customer"
        show={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        supportForm={supportForm}
        setSupportForm={setSupportForm}
        toggleIssue={toggleIssue}
        subscriptionData={SUBSCRIPTION_DATA}
      />
      {renderExtendModal()}
    </div>
  )
}
