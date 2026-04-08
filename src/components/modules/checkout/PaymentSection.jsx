import { Link } from 'react-router-dom'
import {
  CreditCard as CardIcon,
  Calendar,
  Lock,
  Building2,
  Globe,
  Wallet,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Distributor Payment Section (accordion content)                    */
/* ------------------------------------------------------------------ */

export function DistributorPaymentSection({
  totalWithGst,
  agreePaymentTerms,
  onAgreePaymentTermsChange,
  paymentMethods,
  paymentMethod,
  onPaymentMethodChange,
  cardDetails,
  onCardChange,
  onPayNow,
}) {
  return (
    <>
      {/* Total amount */}
      <div className="mb-4">
        <p className="text-sm text-gray-3">Total amount Payable</p>
        <span className="font-heading text-2xl font-bold text-dark">
          {'\u20B9'}{totalWithGst.toLocaleString('en-IN')}/-
        </span>
      </div>

      {/* Terms checkbox */}
      <label className="flex items-start gap-2 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={agreePaymentTerms}
          onChange={(e) => onAgreePaymentTermsChange(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
        />
        <span className="text-sm text-gray-2">
          I hereby agree to Rentr{' '}
          <Link to="/terms" className="text-primary hover:underline">Terms and Conditions</Link>
        </span>
      </label>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left - Payment Method Sidebar */}
        <div className="md:w-56 shrink-0">
          <div className="space-y-1">
            {paymentMethods.map((method) => {
              const isActive = paymentMethod === method.key
              return (
                <button
                  key={method.key}
                  onClick={() => onPaymentMethodChange(method.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-left transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-gray-2 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isActive ? 'border-primary' : 'border-gray-300'
                  }`}>
                    {isActive && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <method.icon size={18} />
                  {method.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right - Payment Form */}
        <div className="flex-1 min-w-0">
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-2 mb-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={onCardChange}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full border border-gray-200 rounded-lg h-[48px] px-4 pr-12 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
                  />
                  <CardIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-2 mb-1">Card holder's Name</label>
                <input
                  type="text"
                  name="cardHolder"
                  value={cardDetails.cardHolder}
                  onChange={onCardChange}
                  placeholder="Name on card"
                  className="w-full border border-gray-200 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-2 mb-1">Expiry Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="expiry"
                      value={cardDetails.expiry}
                      onChange={onCardChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full border border-gray-200 rounded-lg h-[48px] px-4 pr-12 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
                    />
                    <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-2 mb-1">CVV</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={onCardChange}
                      placeholder="***"
                      maxLength={4}
                      className="w-full border border-gray-200 rounded-lg h-[48px] px-4 pr-12 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
                    />
                    <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              <button
                onClick={onPayNow}
                className="btn-primary w-full mt-2"
              >
                Pay now
              </button>

              {/* Card network logos */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded">RuPay</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">VISA</span>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Mastercard</span>
                <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded">Amex</span>
              </div>
            </div>
          )}

          {paymentMethod === 'netbanking' && (
            <div className="text-center py-12 text-gray-3">
              <Building2 size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Select your bank to proceed with Netbanking</p>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="text-center py-12 text-gray-3">
              <Globe size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Enter your UPI ID to proceed</p>
            </div>
          )}

          {paymentMethod === 'wallets' && (
            <div className="text-center py-12 text-gray-3">
              <Wallet size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Select your wallet to proceed</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
