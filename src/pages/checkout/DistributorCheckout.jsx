import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { handleImgError } from '../../constants/images'
import {
  ShoppingCart,
  Truck,
  ShieldCheck,
  ClipboardList,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  FileText,
  Check,
  AlertTriangle,
  Frown,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
// Demo mode: orders handled locally
import {
  DISTRIBUTOR_STEPS,
  DISTRIBUTOR_INITIAL_CART,
  PAYMENT_METHODS,
} from '../../constants/checkout'
import { DistributorStepperBar } from '../../components/modules/checkout/CheckoutStepperBar'
import { DistributorCartTable, DistributorCartSidebar } from '../../components/modules/checkout/CartSummary'
import { DistributorProfileVerification } from '../../components/modules/checkout/ProfileVerification'
import { DistributorAddressSection } from '../../components/modules/checkout/AddressSection'
import { DistributorPaymentSection } from '../../components/modules/checkout/PaymentSection'
import { DistributorOrderSummary, DistributorItemSummary } from '../../components/modules/checkout/OrderSummary'

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DistributorCheckout() {
  const { user } = useAuth()
  const { cart, removeItem: removeCartItem, fetchCart } = useCart()
  const navigate = useNavigate()

  // Stepper
  const [step, setStep] = useState(0)

  // Result screen: null | 'success' | 'failure' | 'cancelled'
  const [resultScreen, setResultScreen] = useState(null)

  // Step 1 - Order details — use real cart if available, else mock
  const apiCartItems = cart.items.map(item => ({
    id: item.id,
    image: item.product_image || '/images/products/server-tower.svg',
    name: item.product_name || 'Product',
    specs: '',
    category: 'Server Rent',
    monthlyRent: item.price_per_month || 0,
    addonsRent: 0,
    retailPrice: (item.price_per_month || 0) * 1.2,
    pricePerMonth: item.price_per_month || 0,
    qty: item.quantity,
    tenure: `${item.rental_months} months`,
    deliveryDate: 'TBD',
    subItems: [],
  }))
  const [cartItems, setCartItems] = useState(apiCartItems.length > 0 ? apiCartItems : DISTRIBUTOR_INITIAL_CART)
  const [coupon, setCoupon] = useState('')

  // Step 2 - Verification (profile)
  const [customerType, setCustomerType] = useState('distributor')
  const [profile, setProfile] = useState({
    fullName: '',
    companyEmail: '',
    companyName: '',
    regAddress: '',
    gstNo: '',
    companyPan: '',
  })
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [referralId, setReferralId] = useState('')

  // Phone verification
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [otpTimer, setOtpTimer] = useState(59)

  // Step 3 - Billing + Shipping
  const [billingAddress, setBillingAddress] = useState({
    country: 'India',
    address1: '',
    address2: '',
    pinCode: '',
    area: '',
    townCity: '',
    state: '',
  })
  const [shippingAddress, setShippingAddress] = useState({
    country: 'India',
    address1: '',
    address2: '',
    pinCode: '',
    area: '',
    townCity: '',
    state: '',
  })
  const [sameAsBilling, setSameAsBilling] = useState(false)

  // Step 5 - Payment
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
  })
  const [agreePaymentTerms, setAgreePaymentTerms] = useState(false)

  // Accordion expanded sections (for step-based accordion view)
  const [expandedSections, setExpandedSections] = useState([0])

  // Derived
  const totalMonthly = cartItems.reduce((s, i) => s + i.monthlyRent + i.addonsRent, 0)
  const totalRetail = cartItems.reduce((s, i) => s + i.retailPrice, 0)
  const gstAmount = Math.round(totalMonthly * 0.18)
  const totalWithGst = totalMonthly + gstAmount

  /* ---- helpers ---- */

  function removeItem(id) {
    if (cart.items.length > 0) {
      removeCartItem(id).catch(() => {})
    }
    setCartItems((prev) => prev.filter((i) => i.id !== id))
  }

  function handleBillingChange(e) {
    setBillingAddress((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  function handleShippingChange(e) {
    setShippingAddress((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  function handleSameAsBilling(e) {
    const checked = e.target.checked
    setSameAsBilling(checked)
    if (checked) {
      setShippingAddress({ ...billingAddress })
    }
  }

  function handleProfileChange(e) {
    const { name, value } = e.target
    setProfile((p) => ({ ...p, [name]: value }))
  }

  function handleCardChange(e) {
    const { name, value } = e.target
    setCardDetails((p) => ({ ...p, [name]: value }))
  }

  function nextStep() {
    setStep((s) => {
      const next = Math.min(s + 1, DISTRIBUTOR_STEPS.length - 1)
      setExpandedSections([next])
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function prevStep() {
    setStep((s) => {
      const prev = Math.max(s - 1, 0)
      setExpandedSections([prev])
      return prev
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goToStep(idx) {
    if (idx <= step) {
      setStep(idx)
      setExpandedSections([idx])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleSendOtp() {
    // placeholder - would call API
  }

  function handleVerifyOtp() {
    setPhoneVerified(true)
  }

  async function handlePayNow() {
    // Demo mode: always succeed
    setResultScreen('success')
    if (cart.items.length > 0) fetchCart()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleSection(idx) {
    setExpandedSections((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    )
  }

  /* ---- Reusable: Section Number Circle ---- */
  const SectionNumber = ({ number, completed = false }) => (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
        completed
          ? 'bg-green-500 text-white'
          : 'bg-primary text-white'
      }`}
    >
      {completed ? <Check size={16} /> : number}
    </div>
  )

  /* ---- Reusable: Accordion Section Wrapper ---- */
  const AccordionSection = ({ index, icon: Icon, title, subtitle, completed, children }) => {
    const isExpanded = expandedSections.includes(index)
    const isAccessible = index <= step

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => isAccessible && toggleSection(index)}
          className={`w-full flex items-center gap-4 p-5 text-left transition-colors ${
            isAccessible ? 'cursor-pointer hover:bg-gray-50/50' : 'cursor-default opacity-60'
          }`}
        >
          <SectionNumber number={index + 1} completed={completed} />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon size={20} className="text-primary shrink-0" />
            <div>
              <h3 className="font-heading font-semibold text-dark text-lg">{title}</h3>
              {subtitle && <p className="text-sm text-gray-3 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {isAccessible && (
            isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="px-5 pb-6 pt-2 border-t border-gray-200">
            {children}
          </div>
        )}
      </div>
    )
  }

  /* ================================================================ */
  /*  RESULT SCREENS                                                   */
  /* ================================================================ */

  if (resultScreen === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <DistributorStepperBar steps={DISTRIBUTOR_STEPS} step={4} />
        <div className="section-container py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-dark mb-2">
                Your Order is confirmed
              </h2>
              <p className="text-gray-3 mb-8">
                Thank you for your order. We will process it shortly and you will receive a confirmation email.
              </p>

              <div className="bg-gray-50 rounded-xl p-6 text-sm space-y-3 text-left mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-3">Order Number</span>
                  <span className="font-heading font-semibold text-dark">DIST-2026-4901</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-3">Estimated Delivery</span>
                  <span className="font-medium text-dark">7th August, 2021</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-3">Monthly Payment</span>
                  <span className="font-heading font-semibold text-dark">
                    {'\u20B9'}{totalMonthly.toLocaleString('en-IN')}/mo
                  </span>
                </div>
              </div>

              {/* Item Summary */}
              <div className="text-left">
                <h3 className="font-heading font-semibold text-dark mb-4">Item Summary</h3>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover bg-gray-200 shrink-0"
                        onError={handleImgError}
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-dark text-sm">{item.name}</p>
                        <p className="text-xs text-gray-3 mt-0.5">{item.specs}</p>
                        <p className="text-xs text-gray-3 mt-1">Qty: {item.qty} | Tenure: {item.tenure}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-heading font-semibold text-dark text-sm">
                          {'\u20B9'}{(item.monthlyRent + item.addonsRent).toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                <Link
                  to="/distributor/dashboard"
                  className="px-6 py-3 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View Dashboard
                </Link>
                <Link
                  to="/search"
                  className="btn-primary text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (resultScreen === 'failure') {
    return (
      <div className="min-h-screen bg-gray-50">
        <DistributorStepperBar steps={DISTRIBUTOR_STEPS} step={4} />
        <div className="section-container py-12">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} className="text-red-500" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-dark mb-2">
                Payment Transaction Failed
              </h2>
              <p className="text-gray-3 mb-8">
                Your payment could not be processed. Please try again or use a different payment method.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setResultScreen(null)}
                  className="px-6 py-3 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Try Again
                </button>
                <Link to="/search" className="btn-primary text-sm">
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (resultScreen === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50">
        <DistributorStepperBar steps={DISTRIBUTOR_STEPS} step={4} />
        <div className="section-container py-12">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
                <Frown size={40} className="text-orange-500" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-dark mb-2">
                Order Cancelled
              </h2>
              <p className="text-gray-3 mb-8">
                Your order has been cancelled. If this was a mistake, you can place a new order.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setResultScreen(null)
                    setStep(0)
                    setExpandedSections([0])
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Start Over
                </button>
                <Link to="/search" className="btn-primary text-sm">
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ---- Empty cart state ---- */
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DistributorStepperBar steps={DISTRIBUTOR_STEPS} step={0} />
        <div className="section-container py-12">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <ShoppingCart size={40} className="text-gray-300" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-dark mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-3 mb-8">
                Looks like you have not added any products to your cart yet.
              </p>
              <Link
                to="/search"
                className="btn-primary inline-flex items-center gap-2"
              >
                Browse our Products <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ================================================================ */
  /*  MAIN RENDER                                                      */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Stepper Bar */}
      <DistributorStepperBar steps={DISTRIBUTOR_STEPS} step={step} onStepClick={goToStep} />

      <div className="section-container py-8">

        {/* ======================================================== */}
        {/*  STEP 1 - ORDER DETAILS                                   */}
        {/* ======================================================== */}
        {step === 0 && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left - Accordion Order Details */}
            <div className="flex-1 min-w-0">
              <AccordionSection
                index={0}
                icon={FileText}
                title="Order Details"
                completed={step > 0}
              >
                <DistributorCartTable
                  cartItems={cartItems}
                  coupon={coupon}
                  onCouponChange={setCoupon}
                />
              </AccordionSection>
            </div>

            {/* Right - Cart Summary Sidebar */}
            <DistributorCartSidebar
              cartItems={cartItems}
              totalMonthly={totalMonthly}
              onRemoveItem={removeItem}
              onProceed={nextStep}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/*  STEP 2 - VERIFY YOUR PROFILE                             */}
        {/* ======================================================== */}
        {step === 1 && (
          <div>
            <button
              onClick={prevStep}
              className="flex items-center gap-1.5 text-sm text-gray-3 hover:text-gray-700 mb-4"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <AccordionSection
              index={1}
              icon={ShieldCheck}
              title="Verify your Profile"
              completed={step > 1}
            >
              <DistributorProfileVerification
                customerType={customerType}
                onCustomerTypeChange={setCustomerType}
                profile={profile}
                onProfileChange={handleProfileChange}
                agreeTerms={agreeTerms}
                onAgreeTermsChange={setAgreeTerms}
                referralId={referralId}
                onReferralIdChange={setReferralId}
                phoneNumber={phoneNumber}
                onPhoneNumberChange={setPhoneNumber}
                otp={otp}
                onOtpChange={setOtp}
                phoneVerified={phoneVerified}
                otpTimer={otpTimer}
                onVerifyOtp={handleVerifyOtp}
              />
            </AccordionSection>

            {/* Bottom proceed */}
            <div className="flex justify-end mt-8">
              <button
                onClick={nextStep}
                className="btn-primary flex items-center gap-2"
              >
                Proceed <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/*  STEP 3 - BILLING AND SHIPPING ADDRESS                     */}
        {/* ======================================================== */}
        {step === 2 && (
          <div>
            <button
              onClick={prevStep}
              className="flex items-center gap-1.5 text-sm text-gray-3 hover:text-gray-700 mb-4"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <AccordionSection
              index={2}
              icon={Truck}
              title="Billing and Shipping Address"
              subtitle="This is where we will ship the products"
              completed={step > 2}
            >
              <DistributorAddressSection
                billingAddress={billingAddress}
                onBillingChange={handleBillingChange}
                shippingAddress={shippingAddress}
                onShippingChange={handleShippingChange}
                sameAsBilling={sameAsBilling}
                onSameAsBillingChange={handleSameAsBilling}
              />
            </AccordionSection>

            {/* Bottom proceed */}
            <div className="flex justify-end mt-8">
              <button
                onClick={nextStep}
                className="btn-primary flex items-center gap-2"
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/*  STEP 4 - ORDER SUMMARY                                    */}
        {/* ======================================================== */}
        {step === 3 && (
          <div>
            <button
              onClick={prevStep}
              className="flex items-center gap-1.5 text-sm text-gray-3 hover:text-gray-700 mb-4"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left - Summary */}
              <div className="flex-1 min-w-0">
                <AccordionSection
                  index={3}
                  icon={ClipboardList}
                  title="Order Summary"
                  completed={step > 3}
                >
                  <DistributorOrderSummary
                    cartItems={cartItems}
                    totalMonthly={totalMonthly}
                    gstAmount={gstAmount}
                    totalWithGst={totalWithGst}
                    coupon={coupon}
                    onCouponChange={setCoupon}
                    billingAddress={billingAddress}
                    shippingAddress={shippingAddress}
                    sameAsBilling={sameAsBilling}
                    onProceedToPayment={nextStep}
                  />
                </AccordionSection>

                {/* Item Summary Section */}
                <DistributorItemSummary cartItems={cartItems} />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/*  STEP 5 - PAYMENT (Select payment mode)                    */}
        {/* ======================================================== */}
        {step === 4 && (
          <div>
            <button
              onClick={prevStep}
              className="flex items-center gap-1.5 text-sm text-gray-3 hover:text-gray-700 mb-4"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <AccordionSection
              index={4}
              icon={CreditCard}
              title="Complete payment"
              subtitle="Choose your payment mode"
              completed={false}
            >
              <DistributorPaymentSection
                totalWithGst={totalWithGst}
                agreePaymentTerms={agreePaymentTerms}
                onAgreePaymentTermsChange={setAgreePaymentTerms}
                paymentMethods={PAYMENT_METHODS}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                cardDetails={cardDetails}
                onCardChange={handleCardChange}
                onPayNow={handlePayNow}
              />
            </AccordionSection>
          </div>
        )}

      </div>
    </div>
  )
}
