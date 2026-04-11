import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { saleorOrders as saleorOrdersApi } from '../../services/saleor'
import { handleImgError } from '../../constants/images'
import {
  Crown,
  Package,
  FileText,
  Users,
  Send,
  CreditCard,
  RefreshCw,
  Download,
  Star,
  Copy,
  X,
  LifeBuoy,
  PenLine,
  RotateCcw,
  Wallet,
  Landmark,
  Smartphone,
} from 'lucide-react'

import {
  DISTRIBUTOR_COMPANY_INFO as COMPANY_INFO,
  DISTRIBUTOR_INVOICE_SUMMARY as INVOICE_SUMMARY,
  DISTRIBUTOR_SUBSCRIPTION_DATA as SUBSCRIPTION_DATA,
  DISTRIBUTOR_LEDGER_DATA as LEDGER_DATA,
  DISTRIBUTOR_SUPPORT_TICKETS as SUPPORT_TICKETS,
  DISTRIBUTOR_TRACK_ORDERS as TRACK_ORDERS,
  DISTRIBUTOR_PREVIOUS_ORDERS as PREVIOUS_ORDERS,
  DISTRIBUTOR_INVOICES_DATA as INVOICES_DATA,
  DISTRIBUTOR_PAYMENTS_DATA as PAYMENTS_DATA,
  DISTRIBUTOR_CREDITS_DATA as CREDITS_DATA,
  DISTRIBUTOR_REFUND_TRACK_DATA as REFUND_TRACK_DATA,
  DISTRIBUTOR_SAVED_CARDS as SAVED_CARDS,
  DISTRIBUTOR_CLIENT_LIST as CLIENT_LIST,
  DISTRIBUTOR_STATUS_BADGE as STATUS_BADGE,
} from '../../constants/distributorDashboard'

import DashboardSidebar from '../../components/modules/dashboard/DashboardSidebar'
import MobileBackHeader from '../../components/modules/dashboard/MobileBackHeader'
import SubTabs from '../../components/modules/dashboard/SubTabs'
import SubscriptionCard from '../../components/modules/dashboard/SubscriptionCard'
import { Badge, TimelineBar } from '../../components/modules/dashboard/SubscriptionCard'
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
  { key: 'subscription', label: 'My Subscription', icon: Crown },
  { key: 'orders', label: 'My Orders', icon: Package },
  { key: 'clients', label: 'Clients', icon: Users },
  { key: 'invoice', label: 'Invoice', icon: FileText },
  { key: 'referral', label: 'Referral', icon: Star },
  { key: 'requests', label: 'Requests', icon: Send },
  { key: 'payment', label: 'Payment Settings', icon: CreditCard },
  { key: 'refund', label: 'Refund Status', icon: RefreshCw },
]

// ─── Component ───
export default function DistributorDashboard() {
  const { user, token } = useAuth()

  // Saleor order history
  const [saleorOrders, setSaleorOrders] = useState([])

  useEffect(() => {
    if (token) {
      saleorOrdersApi.getMyOrders(token)
        .then(result => setSaleorOrders(result.orders))
        .catch(err => console.error('[Saleor] Failed to fetch orders:', err))
    }
  }, [token])

  // Sidebar
  const [activeTab, setActiveTab] = useState('subscription')
  const [mobileNavOpen, setMobileNavOpen] = useState(true)

  // Subscription sub-tabs
  const [subTab, setSubTab] = useState('details')
  const [ticketFilter, setTicketFilter] = useState('ongoing')

  // Renew/Extend modal
  const [showRenewModal, setShowRenewModal] = useState(false)
  const [renewModalTab, setRenewModalTab] = useState('active')
  const [tenureExtensions, setTenureExtensions] = useState({})

  // Cancel Subscription modal
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReasons, setCancelReasons] = useState([])
  const [cancelAssets, setCancelAssets] = useState([])

  // Partial Return modal
  const [showPartialReturnModal, setShowPartialReturnModal] = useState(false)
  const [returnAssets, setReturnAssets] = useState([])
  const [returnReason, setReturnReason] = useState('')

  // Orders sub-tabs
  const [orderSubTab, setOrderSubTab] = useState('track')
  const [hasOngoingOrders] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(0)

  // Invoice sub-tabs
  const [invoiceSubTab, setInvoiceSubTab] = useState('invoices')

  // Referral
  const [referralEmail, setReferralEmail] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)

  // Requests
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [supportForm, setSupportForm] = useState({
    asset: '',
    serial: '',
    address: '',
    mobile: '',
    issues: [],
    query: '',
  })

  // Payment Settings
  const [paymentView] = useState('main')
  const [paymentMethod, setPaymentMethod] = useState('card')

  // Refund sub-tabs
  const [refundSubTab, setRefundSubTab] = useState('track')

  // ─── Helpers ───
  const displayName = user?.full_name || 'John Doe'

  const copyReferralCode = () => {
    navigator.clipboard?.writeText('RENTRFFRL')
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const toggleIssue = (issue) => {
    setSupportForm((prev) => ({
      ...prev,
      issues: prev.issues.includes(issue)
        ? prev.issues.filter((i) => i !== issue)
        : [...prev.issues, issue],
    }))
  }

  const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`

  const handleTenureSlider = (assetId, value) => {
    setTenureExtensions((prev) => ({ ...prev, [assetId]: value }))
  }

  const toggleCancelAsset = (id) => {
    setCancelAssets((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id])
  }

  const toggleCancelReason = (reason) => {
    setCancelReasons((prev) => prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason])
  }

  const toggleReturnAsset = (id) => {
    setReturnAssets((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id])
  }

  // ─── Renew / Extend Subscription Modal ───
  const renderRenewModal = () => {
    const activeAssets = SUBSCRIPTION_DATA.filter((a) => a.status === 'Active')
    const expiredAssets = SUBSCRIPTION_DATA.filter((a) => a.status === 'Expired')

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="font-heading text-lg font-bold text-dark">Renew / Extend Subscription</h3>
            <button
              onClick={() => setShowRenewModal(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Active / Expired tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setRenewModalTab('active')}
              className={`flex-1 py-3 text-sm font-semibold text-center ${renewModalTab === 'active' ? 'text-primary border-b-2 border-primary' : 'text-gray-3'}`}
            >
              Active ({activeAssets.length})
            </button>
            <button
              onClick={() => setRenewModalTab('expired')}
              className={`flex-1 py-3 text-sm font-semibold text-center ${renewModalTab === 'expired' ? 'text-primary border-b-2 border-primary' : 'text-gray-3'}`}
            >
              Expired ({expiredAssets.length})
            </button>
          </div>

          <div className="p-6 space-y-5">
            {(renewModalTab === 'active' ? activeAssets : expiredAssets).map((asset) => (
              <div key={asset.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-4 mb-3">
                  <img src={asset.image} alt={asset.brand} className="w-12 h-12 rounded-lg object-cover" onError={handleImgError} loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-dark font-semibold truncate">{asset.brand} {asset.model}</p>
                    <p className="text-xs text-gray-3">ID: {asset.itemId} | Qty: {asset.qty}</p>
                  </div>
                  <Badge status={asset.status} statusBadgeMap={STATUS_BADGE} />
                </div>

                <TimelineBar startDate={asset.startDate} endDate={asset.endDate} progress={asset.progress} status={asset.status} />

                {renewModalTab === 'active' && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-2">Extend by</span>
                      <span className="text-dark font-semibold">{tenureExtensions[asset.id] || 0} months</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={24}
                      step={3}
                      value={tenureExtensions[asset.id] || 0}
                      onChange={(e) => handleTenureSlider(asset.id, Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-gray-3">
                      <span>0</span><span>6</span><span>12</span><span>18</span><span>24</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-3">
              <button
                onClick={() => setShowRenewModal(false)}
                className="btn-primary flex-1 py-3 text-sm font-semibold"
              >
                Place request
              </button>
              <button
                onClick={() => setShowRenewModal(false)}
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

  // ─── Partial Return Modal ───
  const renderPartialReturnModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="font-heading text-lg font-bold text-dark">Partial Return</h3>
          <button
            onClick={() => setShowPartialReturnModal(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <p className="text-sm font-semibold text-dark mb-3">Select assets to return</p>
            {SUBSCRIPTION_DATA.filter((a) => a.status === 'Active').map((asset) => (
              <label key={asset.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={returnAssets.includes(asset.id)}
                  onChange={() => toggleReturnAsset(asset.id)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <img src={asset.image} alt={asset.brand} className="w-10 h-10 rounded-lg" onError={handleImgError} loading="lazy" />
                <div>
                  <p className="text-sm font-medium text-dark">{asset.brand} {asset.model}</p>
                  <p className="text-xs text-gray-3">Qty: {asset.qty}</p>
                </div>
              </label>
            ))}
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Return reason</label>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="input-field-rect w-full min-h-[80px] resize-none text-sm"
              placeholder="Describe your reason for return..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPartialReturnModal(false)}
              className="btn-primary flex-1 py-3 text-sm font-semibold"
            >
              Submit Return Request
            </button>
            <button
              onClick={() => setShowPartialReturnModal(false)}
              className="btn-outline flex-1 py-3 text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ─── My Subscription ───
  const renderSubscription = () => (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-dark">Hello {displayName}</h2>
            <p className="text-gray-3 text-sm mt-1">Distributor since: Nov 24, 2021</p>
          </div>
        </div>
      </div>

      {/* Company Info + Due Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-3 font-semibold mb-1">Company Name</p>
              <p className="text-sm font-semibold text-dark">{COMPANY_INFO.name}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-3 font-semibold mb-1">GSTIN/UIN</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-2">{COMPANY_INFO.gstin}</p>
                <Link to="#" className="text-primary text-xs hover:underline">pdf</Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-3 font-semibold mb-1">Company Pan</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-2">{COMPANY_INFO.pan}</p>
                <Link to="#" className="text-primary text-xs hover:underline">pdf</Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-3 font-semibold mb-1">Dealer Ref</p>
              <p className="text-sm font-medium text-gray-2">{COMPANY_INFO.dealerRef}</p>
            </div>
          </div>
        </div>

        {/* Total Due Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <p className="text-[11px] uppercase tracking-wider text-gray-3 font-semibold mb-2">Total Due</p>
          <p className="font-heading text-3xl font-bold text-dark mb-1">{formatCurrency(INVOICE_SUMMARY.totalDue)}<span className="text-red-500">-</span></p>
          <button className="btn-primary w-full py-2.5 text-sm font-semibold mt-3 mb-2">Pay now</button>
          <p className="text-xs text-gray-3 text-center">(Due date: {INVOICE_SUMMARY.dueDate})</p>
          <Link to="#" className="flex items-center justify-center gap-1.5 text-sm text-primary hover:underline font-medium mt-3">
            <Download size={14} />
            Download Invoice
          </Link>
          <p className="text-xs text-gray-3 text-center mt-1">Invoice Generated on: {INVOICE_SUMMARY.invoiceDate}</p>
        </div>
      </div>

      {/* Action buttons row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => setShowRenewModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Extend Subscription
        </button>
        <button
          onClick={() => setShowSupportModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-gray-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Support Request
        </button>
        <button
          onClick={() => setShowCancelModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Cancel Subscription
        </button>
      </div>

      {/* Tabs: LEDGER | SUBSCRIPTION DETAILS | SUPPORT TICKETS */}
      <SubTabs
        variant="distributor"
        tabs={[
          { key: 'ledger', label: 'Ledger' },
          { key: 'details', label: 'Subscription Details' },
          { key: 'support', label: 'Support Tickets' },
        ]}
        active={subTab}
        onChange={setSubTab}
      />

      {subTab === 'details' && (
        <SubscriptionCard
          data={SUBSCRIPTION_DATA}
          variant="distributor"
          onRenew={() => setShowRenewModal(true)}
          statusBadgeMap={STATUS_BADGE}
          formatCurrency={formatCurrency}
        />
      )}
      {subTab === 'ledger' && renderSubscriptionLedger()}
      {subTab === 'support' && (
        <SupportTickets
          tickets={SUPPORT_TICKETS}
          variant="distributor"
          ticketFilter={ticketFilter}
          setTicketFilter={setTicketFilter}
          statusBadgeMap={STATUS_BADGE}
        />
      )}
    </div>
  )

  // ─── Ledger ───
  const renderSubscriptionLedger = () => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Month</th>
              <th className="text-right px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Rent</th>
              <th className="hidden sm:table-cell text-right px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Discount</th>
              <th className="hidden sm:table-cell text-right px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Late Fee</th>
              <th className="text-right px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Total</th>
              <th className="hidden md:table-cell text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Invoice</th>
              <th className="text-center px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {LEDGER_DATA.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5 text-dark font-medium">{row.month}</td>
                <td className="px-5 py-3.5 text-right text-gray-2">{formatCurrency(row.rent)}</td>
                <td className="hidden sm:table-cell px-5 py-3.5 text-right text-green-500">{row.discount > 0 ? `-${formatCurrency(row.discount)}` : '-'}</td>
                <td className="hidden sm:table-cell px-5 py-3.5 text-right text-accent-orange">{row.lateFee > 0 ? formatCurrency(row.lateFee) : '-'}</td>
                <td className="px-5 py-3.5 text-right text-dark font-semibold">{formatCurrency(row.total)}</td>
                <td className="hidden md:table-cell px-5 py-3.5"><Link to="#" className="text-primary hover:underline font-medium">{row.invoice}</Link></td>
                <td className="px-5 py-3.5 text-center"><Badge status={row.status} statusBadgeMap={STATUS_BADGE} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ─── My Orders ───
  const renderOrders = () => {
    return (
      <div>
        <SubTabs
          variant="distributor"
          tabs={[
            { key: 'track', label: 'Track Order' },
            { key: 'previous', label: 'Previous Order' },
          ]}
          active={orderSubTab}
          onChange={setOrderSubTab}
        />
        {orderSubTab === 'track' ? (
          <OrderTracking
            variant="distributor"
            trackOrders={TRACK_ORDERS}
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
            hasOngoingOrders={hasOngoingOrders}
            formatCurrency={formatCurrency}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Item</th>
                    <th className="text-right px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Qty</th>
                    <th className="hidden md:table-cell text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Sales Person</th>
                    <th className="hidden sm:table-cell text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Subscribed On</th>
                    <th className="hidden sm:table-cell text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Rental Period</th>
                    <th className="text-right px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {(saleorOrders.length > 0 ? saleorOrders : PREVIOUS_ORDERS).map((o, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-dark font-medium">{o.item}</td>
                      <td className="px-5 py-3.5 text-right text-gray-2">{o.qty}</td>
                      <td className="hidden md:table-cell px-5 py-3.5 text-gray-2">{o.salesPerson}</td>
                      <td className="hidden sm:table-cell px-5 py-3.5 text-gray-3">{o.subscribedOn}</td>
                      <td className="hidden sm:table-cell px-5 py-3.5 text-gray-2">{o.rentalPeriod}</td>
                      <td className="px-5 py-3.5 text-right text-dark font-semibold">{formatCurrency(o.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── Clients (All Clients) ───
  const renderClients = () => (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-bold text-dark uppercase tracking-wide">All Clients</h3>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Customer</th>
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Item</th>
                <th className="hidden sm:table-cell text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Start Date - End Date</th>
                <th className="hidden md:table-cell text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Invoice</th>
                <th className="text-right px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Payment Amount</th>
                <th className="text-center px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {CLIENT_LIST.map((client) => (
                <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-dark font-medium">{client.name}</p>
                    <p className="text-xs text-gray-3">{client.id}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-dark font-medium">{client.item}</p>
                    <p className="text-xs text-gray-3">{client.itemId}</p>
                  </td>
                  <td className="hidden sm:table-cell px-5 py-3.5 text-gray-2 text-xs">{client.startDate} - {client.endDate}</td>
                  <td className="hidden md:table-cell px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-primary font-medium text-xs">{client.invoice}</span>
                      <button className="text-gray-3 hover:text-primary transition-colors">
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right text-dark font-semibold">{formatCurrency(client.paymentAmount)}</td>
                  <td className="px-5 py-3.5 text-center"><Badge status={client.paymentStatus} statusBadgeMap={STATUS_BADGE} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // ─── Invoice Tab ───
  const renderInvoice = () => (
    <div>
      <SubTabs
        variant="distributor"
        tabs={[
          { key: 'invoices', label: 'Invoices' },
          { key: 'payments', label: 'Payments' },
          { key: 'credits', label: 'Credits' },
        ]}
        active={invoiceSubTab}
        onChange={setInvoiceSubTab}
      />
      <InvoiceTable
        variant="distributor"
        invoiceSubTab={invoiceSubTab}
        invoicesData={INVOICES_DATA}
        paymentsData={PAYMENTS_DATA}
        creditsData={CREDITS_DATA}
        formatCurrency={formatCurrency}
      />
    </div>
  )

  // ─── Referral Tab ───
  const renderReferral = () => (
    <ReferralSection
      variant="distributor"
      referralEmail={referralEmail}
      setReferralEmail={setReferralEmail}
      codeCopied={codeCopied}
      copyReferralCode={copyReferralCode}
      formatCurrency={formatCurrency}
    />
  )

  // ─── Requests Tab (4 cards) ───
  const renderRequests = () => (
    <div className="space-y-6">
      <h3 className="font-heading text-lg font-bold text-dark uppercase tracking-wide">Requests</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Support Request */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <LifeBuoy size={20} className="text-primary" />
            </div>
            <h4 className="font-heading text-base font-bold text-dark">Support Request</h4>
          </div>
          <p className="text-sm text-gray-3 mb-4 leading-relaxed">
            Raise a support ticket for hardware, software, or service issues with your subscribed assets.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSupportModal(true)}
              className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              New Request
            </button>
            <button className="text-sm text-primary font-medium hover:underline">Past Requests</button>
          </div>
        </div>

        {/* Partial Return */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <RotateCcw size={20} className="text-primary" />
            </div>
            <h4 className="font-heading text-base font-bold text-dark">Partial Return</h4>
          </div>
          <p className="text-sm text-gray-3 mb-4 leading-relaxed">
            Return specific assets from your subscription while keeping the remaining items active.
          </p>
          <button
            onClick={() => setShowPartialReturnModal(true)}
            className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            New Request
          </button>
        </div>

        {/* Renewal / Extend */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <PenLine size={20} className="text-primary" />
            </div>
            <h4 className="font-heading text-base font-bold text-dark">Renewal / Extend Subscription</h4>
          </div>
          <p className="text-sm text-gray-3 mb-4 leading-relaxed">
            Extend your current subscription tenure or renew expired subscriptions to continue service.
          </p>
          <button
            onClick={() => setShowRenewModal(true)}
            className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            New Request
          </button>
        </div>

        {/* Cancel Subscription */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <X size={20} className="text-red-500" />
            </div>
            <h4 className="font-heading text-base font-bold text-dark">Cancel Subscription</h4>
          </div>
          <p className="text-sm text-gray-3 mb-4 leading-relaxed">
            Cancel your subscription for selected or all assets. Applicable fees may apply as per terms.
          </p>
          <button
            onClick={() => setShowCancelModal(true)}
            className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            New Request
          </button>
        </div>
      </div>
    </div>
  )

  // ─── Payment Settings Tab ───
  const renderPaymentSettings = () => (
    <div className="space-y-6">
      {paymentView === 'main' ? (
        <>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="font-heading text-lg font-bold text-dark uppercase tracking-wide mb-1">Turn on Auto Debit</h3>
            <p className="text-sm text-gray-3 mb-4">Select Payment Method <span className="text-primary font-medium">Step 1 of 2</span></p>

            {/* Payment method tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { key: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                { key: 'bank', label: 'Netbanking', icon: Landmark },
                { key: 'upi', label: 'UPI', icon: Smartphone },
                { key: 'wallet', label: 'Wallets', icon: Wallet },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setPaymentMethod(m.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    paymentMethod === m.key
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-2 hover:bg-gray-200'
                  }`}
                >
                  <m.icon size={14} />
                  {m.label}
                </button>
              ))}
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-3 font-semibold mb-1.5">Card Number</label>
                  <input type="text" className="input-field-rect w-full text-sm" placeholder="0000 0000 0000 0000" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-3 font-semibold mb-1.5">Card holder's Name</label>
                  <input type="text" className="input-field-rect w-full text-sm" placeholder="Name on card" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-3 font-semibold mb-1.5">Expiry Date</label>
                    <input type="text" className="input-field-rect w-full text-sm" placeholder="MM/YY" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-3 font-semibold mb-1.5">CVV</label>
                    <input type="password" className="input-field-rect w-full text-sm" placeholder="***" />
                  </div>
                </div>
                <button className="btn-primary w-full py-3 text-sm font-semibold mt-2">Pay now</button>

                {/* Card logos */}
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-[10px] text-gray-3 uppercase tracking-wider">We accept:</span>
                  {['RuPay', 'Visa', 'Mastercard', 'Amex'].map((brand) => (
                    <span key={brand} className="text-xs font-semibold text-gray-2 bg-gray-100 px-2 py-1 rounded">{brand}</span>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-3 font-semibold mb-1.5">UPI ID</label>
                  <input type="text" className="input-field-rect w-full text-sm" placeholder="name@upi" />
                </div>
                <button className="btn-primary w-full py-3 text-sm font-semibold">Pay now</button>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-3 font-semibold mb-1.5">Select Bank</label>
                  <select className="input-field-rect w-full text-sm">
                    <option value="">Choose your bank</option>
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
                <button className="btn-primary w-full py-3 text-sm font-semibold">Pay now</button>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  {['Paytm', 'PhonePe', 'Amazon Pay', 'Freecharge'].map((w) => (
                    <label key={w} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200">
                      <input type="radio" name="wallet" className="text-primary focus:ring-primary" />
                      <span className="text-sm text-dark font-medium">{w}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary w-full py-3 text-sm font-semibold">Pay now</button>
              </div>
            )}
          </div>

          {/* Saved cards */}
          <SavedCards cards={SAVED_CARDS} variant="distributor" />
        </>
      ) : null}
    </div>
  )

  // ─── Refund Status Tab ───
  const renderRefundStatus = () => (
    <RefundTracking
      variant="distributor"
      refundTrackData={REFUND_TRACK_DATA}
      formatCurrency={formatCurrency}
      statusBadgeMap={STATUS_BADGE}
    />
  )

  // ─── Tab content mapping ───
  const renderTabContent = () => {
    const activeLabel = SIDEBAR_ITEMS.find(i => i.key === activeTab)?.label || ''
    let content = null
    switch (activeTab) {
      case 'subscription':
        content = renderSubscription(); break
      case 'orders':
        content = renderOrders(); break
      case 'clients':
        content = renderClients(); break
      case 'invoice':
        content = renderInvoice(); break
      case 'referral':
        content = renderReferral(); break
      case 'requests':
        content = renderRequests(); break
      case 'payment':
        content = renderPaymentSettings(); break
      case 'refund':
        content = renderRefundStatus(); break
      default:
        return null
    }
    return (
      <>
        <MobileBackHeader variant="distributor" title={activeLabel} onBack={() => setMobileNavOpen(true)} />
        {content}
      </>
    )
  }

  // ─── RENDER ───

  // Mobile navigation landing
  const renderMobileNav = () => (
    <div className="lg:hidden section-container py-6">
      <h2 className="font-heading text-2xl font-bold text-dark mb-6">My Account</h2>
      <div className="grid grid-cols-2 gap-3">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key)
                setMobileNavOpen(false)
                if (item.key === 'subscription') setSubTab('details')
                if (item.key === 'orders') setOrderSubTab('track')
                if (item.key === 'invoice') setInvoiceSubTab('invoices')
                if (item.key === 'refund') setRefundSubTab('track')
              }}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-primary/30 transition-all"
            >
              <Icon size={18} className="text-primary" />
              <span className="text-sm font-medium text-dark">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  const handleDistributorSidebarChange = (key) => {
    setActiveTab(key)
    if (key === 'subscription') setSubTab('details')
    if (key === 'orders') setOrderSubTab('track')
    if (key === 'invoice') setInvoiceSubTab('invoices')
    if (key === 'refund') setRefundSubTab('track')
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Mobile Navigation Landing */}
      {mobileNavOpen && (
        <div className="lg:hidden">
          {renderMobileNav()}
        </div>
      )}

      <div className={`${mobileNavOpen ? 'hidden lg:flex' : 'flex flex-col lg:flex-row'}`}>
        {/* Left Sidebar - Dark Navy */}
        <DashboardSidebar
          items={SIDEBAR_ITEMS}
          activeTab={activeTab}
          onTabChange={handleDistributorSidebarChange}
          variant="distributor"
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {renderTabContent()}
        </main>
      </div>

      {/* Modals */}
      {showRenewModal && renderRenewModal()}
      <CancelModal
        variant="distributor"
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        cancelReasons={cancelReasons}
        toggleCancelReason={toggleCancelReason}
        subscriptionData={SUBSCRIPTION_DATA}
        cancelAssets={cancelAssets}
        toggleCancelAsset={toggleCancelAsset}
      />
      {showPartialReturnModal && renderPartialReturnModal()}
      <SupportModal
        variant="distributor"
        show={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        supportForm={supportForm}
        setSupportForm={setSupportForm}
        toggleIssue={toggleIssue}
        subscriptionData={SUBSCRIPTION_DATA}
      />
    </div>
  )
}
