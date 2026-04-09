import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
// Demo mode: orders handled locally
import {
  CUSTOMER_TOP_STEPS,
  CUSTOMER_SECTION_STEPS,
} from '../../constants/checkout'
import { CustomerStepperBar } from '../../components/modules/checkout/CheckoutStepperBar'
import { CustomerCartSummary } from '../../components/modules/checkout/CartSummary'
import { CustomerProfileVerification } from '../../components/modules/checkout/ProfileVerification'
import { CustomerAddressSection } from '../../components/modules/checkout/AddressSection'

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CustomerCheckout() {
  const { user } = useAuth()
  const { cart, removeItem: removeCartItem, fetchCart } = useCart()
  const navigate = useNavigate()

  // Active section (0 = Order, 1 = Verify, 2 = Address)
  const [activeSection, setActiveSection] = useState(0)
  const [coupon, setCoupon] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Step 2 - Verification / Profile
  const [profileTab, setProfileTab] = useState('customer')
  const [profile, setProfile] = useState({
    fullName: user?.full_name || '',
    website: '',
    companyEmail: user?.email || '',
    phoneNumber: user?.phone || '',
    companyName: user?.company_name || '',
    industry: user?.industry || '',
    gstin: user?.gst_no || '',
    companyPan: user?.company_pan || '',
    proofFile: null,
    termsAccepted: false,
    referralCode: '',
  })
  const [verifyPhone, setVerifyPhone] = useState(user?.phone || '+91 98765 43210')
  const [otp, setOtp] = useState('')
  const [resendTimer, setResendTimer] = useState(13)

  // Step 3 - Address & Reference
  const [address, setAddress] = useState({
    country: 'India',
    address1: '',
    address2: '',
    pinCode: '',
    area: '',
    townCity: '',
    state: '',
  })
  const [reference, setReference] = useState({
    name: '',
    contactNumber: '',
    email: '',
    designation: '',
    department: '',
    skypeId: '',
    fax: '',
  })
  const [showMoreDetails, setShowMoreDetails] = useState(false)

  // Adapt cart items to the shape expected by CustomerCartSummary
  const cartItems = cart.items.map(item => ({
    id: item.id,
    name: item.product_name || 'Product',
    price: item.price_per_month || 0,
    qty: item.quantity,
    category: 'Products Rent',
    image: item.product_image,
  }))

  const totalMonthly = cart.total_monthly || 0
  const productsRent = totalMonthly
  const addonsRent = 0

  /* ---- helpers ---- */

  async function handleRemoveItem(id) {
    try {
      await removeCartItem(id)
    } catch { /* ignore */ }
  }

  function handleProfileChange(e) {
    const { name, value, type, checked } = e.target
    setProfile((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleAddressChange(e) {
    setAddress((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  function handleReferenceChange(e) {
    const { name, value } = e.target
    setReference((p) => ({ ...p, [name]: value }))
  }

  function goToSection(idx) {
    setActiveSection(idx)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handlePlaceOrder() {
    if (!address.address1 || !address.townCity || !address.state || !address.pinCode) {
      setError('Please fill in all required address fields')
      return
    }

    setSubmitting(true)
    setError('')
    // Demo mode: fake order creation
    const order = {
      id: 'ORD-DEMO-' + Date.now(),
      status: 'confirmed',
      total_monthly: cart.total_monthly,
      items: cart.items,
      created_at: new Date().toISOString(),
    }
    navigate('/order-success', { state: { order } })
    fetchCart()
    setSubmitting(false)
  }

  const fmt = (n) => n.toLocaleString('en-IN')

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  if (cart.items.length === 0 && !submitting) {
    return (
      <div className="min-h-screen bg-[#eaeaf3] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-xl font-bold text-dark mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/search')}
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#eaeaf3]">
      {/* TOP STEPPER BAR */}
      <CustomerStepperBar steps={CUSTOMER_TOP_STEPS} />

      {/* MAIN CONTENT */}
      <div className="section-container py-8">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">{error}</div>
        )}
        <div className="flex gap-8">
          {/* LEFT: Vertical Step Numbers */}
          <div className="hidden lg:flex flex-col items-center pt-6 shrink-0">
            {CUSTOMER_SECTION_STEPS.map((s, i) => (
              <div key={s.number} className="flex flex-col items-center">
                <button
                  onClick={() => goToSection(i)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-['Space_Grotesk'] transition-colors ${
                    activeSection === i
                      ? 'bg-[#3b3b3b] text-white'
                      : 'bg-white border border-gray-300 text-[#828282]'
                  }`}
                >
                  {s.number}
                </button>
                {i < CUSTOMER_SECTION_STEPS.length - 1 && (
                  <div className="w-px h-[420px] border-l border-dashed border-[#bdbdbd] my-2" />
                )}
              </div>
            ))}
          </div>

          {/* RIGHT: Content Sections */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* SECTION 1: Order Details */}
            <CustomerCartSummary
              cartItems={cartItems}
              productsRent={productsRent}
              addonsRent={addonsRent}
              totalMonthly={totalMonthly}
              coupon={coupon}
              onCouponChange={setCoupon}
              onRemoveItem={handleRemoveItem}
              onProceed={() => goToSection(1)}
              fmt={fmt}
            />

            {/* SECTION 2: Verify your Profile */}
            <CustomerProfileVerification
              profileTab={profileTab}
              onProfileTabChange={setProfileTab}
              profile={profile}
              onProfileChange={handleProfileChange}
              verifyPhone={verifyPhone}
              onVerifyPhoneChange={setVerifyPhone}
              otp={otp}
              onOtpChange={setOtp}
              resendTimer={resendTimer}
              onContinue={() => goToSection(2)}
            />

            {/* SECTION 3: Delivery Address & Reference */}
            <CustomerAddressSection
              address={address}
              onAddressChange={handleAddressChange}
              reference={reference}
              onReferenceChange={handleReferenceChange}
              showMoreDetails={showMoreDetails}
              onToggleMoreDetails={() => setShowMoreDetails(!showMoreDetails)}
            />

            {/* Place Order Button */}
            <div className="flex justify-end">
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="bg-primary text-white font-semibold px-10 py-3.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {submitting ? 'Placing Order...' : 'Place Order & Pay'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
