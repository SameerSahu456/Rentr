import { Link } from 'react-router-dom'
import {
  Upload,
  Phone,
  Info,
  CheckCircle2,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Customer Profile Verification (split-panel: form + phone OTP)      */
/* ------------------------------------------------------------------ */

export function CustomerProfileVerification({
  profileTab,
  onProfileTabChange,
  profile,
  onProfileChange,
  verifyPhone,
  onVerifyPhoneChange,
  otp,
  onOtpChange,
  resendTimer,
  onContinue,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Left half: Profile form */}
        <div className="flex-1 p-6 lg:p-8">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#17113e] mb-6">
            Verify your Profile
          </h2>

          {/* Customer / Distributor toggle */}
          <div className="flex gap-1 bg-[#f2f2f2] rounded-lg p-1 max-w-[240px] mb-6">
            {['customer', 'distributor'].map((tab) => (
              <button
                key={tab}
                onClick={() => onProfileTabChange(tab)}
                className={`flex-1 py-2 text-sm font-['Poppins'] font-medium rounded-md capitalize transition-colors ${
                  profileTab === tab
                    ? 'bg-[#6d5ed6] text-white shadow-sm'
                    : 'text-[#828282] hover:text-[#4f4f4f]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={onProfileChange}
                placeholder="John Doe"
                className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={profile.website}
                onChange={onProfileChange}
                placeholder="www.example.com"
                className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Company Email
              </label>
              <input
                type="email"
                name="companyEmail"
                value={profile.companyEmail}
                onChange={onProfileChange}
                placeholder="you@company.com"
                className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={onProfileChange}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={profile.companyName}
                onChange={onProfileChange}
                placeholder="Acme Corp"
                className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Industry
              </label>
              <input
                type="text"
                name="industry"
                value={profile.industry}
                onChange={onProfileChange}
                placeholder="Technology"
                className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                GSTIN No
              </label>
              <input
                type="text"
                name="gstin"
                value={profile.gstin}
                onChange={onProfileChange}
                placeholder="22AAAAA0000A1Z5"
                className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Company Pan
              </label>
              <input
                type="text"
                name="companyPan"
                value={profile.companyPan}
                onChange={onProfileChange}
                placeholder="ABCDE1234F"
                className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>
          </div>

          {/* Upload Proof */}
          <div className="mt-5">
            <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
              Upload Proof for verification
            </label>
            <div className="border-2 border-dashed border-[#e0e0e0] rounded-lg p-4 flex items-center justify-center gap-2 text-[#828282] text-sm font-['Poppins'] cursor-pointer hover:border-[#6d5ed6] transition-colors">
              <Upload size={18} />
              <span>Click to upload or drag and drop</span>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-5 flex items-start gap-2">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={profile.termsAccepted}
              onChange={onProfileChange}
              className="mt-0.5 w-4 h-4 accent-[#6d5ed6] rounded"
            />
            <label className="text-xs font-['Poppins'] text-[#4f4f4f]">
              I agree to the{' '}
              <Link to="/terms" className="text-[#6d5ed6] underline">
                terms and conditions
              </Link>
            </label>
          </div>

          {/* Referral Code */}
          <div className="mt-5">
            <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
              Referral code
            </label>
            <input
              type="text"
              name="referralCode"
              value={profile.referralCode}
              onChange={onProfileChange}
              placeholder="Enter referral code"
              className="w-full max-w-[280px] px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
            />
          </div>
        </div>

        {/* Vertical divider */}
        <div className="hidden lg:block w-px bg-[#e0e0e0] my-6" />

        {/* Right half: Phone verification */}
        <div className="lg:w-[380px] shrink-0 p-6 lg:p-8 border-t lg:border-t-0">
          <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#17113e] mb-6">
            Verify your Phone number
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Phone number
              </label>
              <div className="relative">
                <Phone
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bdbdbd]"
                />
                <input
                  type="tel"
                  value={verifyPhone}
                  onChange={(e) => onVerifyPhoneChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm font-['Poppins'] text-[#333] focus:outline-none focus:border-[#6d5ed6] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => onOtpChange(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
                className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors tracking-widest"
              />
            </div>

            <div className="flex items-center justify-between">
              <button className="text-sm font-['Poppins'] text-[#6d5ed6] font-medium hover:underline">
                Change number
              </button>
              <span className="text-xs font-['Poppins'] text-[#828282]">
                Resend in 00:{String(resendTimer).padStart(2, '0')}
              </span>
            </div>

            <button
              onClick={onContinue}
              className="w-full bg-[#6d5ed6] text-white font-['Poppins'] font-medium py-2.5 rounded-lg hover:bg-[#5b4ec4] transition-colors mt-2"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Distributor Profile Verification (accordion content)               */
/* ------------------------------------------------------------------ */

export function DistributorProfileVerification({
  customerType,
  onCustomerTypeChange,
  profile,
  onProfileChange,
  agreeTerms,
  onAgreeTermsChange,
  referralId,
  onReferralIdChange,
  phoneNumber,
  onPhoneNumberChange,
  otp,
  onOtpChange,
  phoneVerified,
  otpTimer,
  onVerifyOtp,
}) {
  return (
    <>
      {/* Customer Type Toggle */}
      <div className="flex items-center gap-0 mb-6">
        <button
          onClick={() => onCustomerTypeChange('customer')}
          className={`px-6 py-2.5 text-sm font-medium rounded-l-full border transition-colors ${
            customerType === 'customer'
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-gray-2 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Customer
        </button>
        <button
          onClick={() => onCustomerTypeChange('distributor')}
          className={`px-6 py-2.5 text-sm font-medium rounded-r-full border-y border-r flex items-center gap-2 transition-colors ${
            customerType === 'distributor'
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-gray-2 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Distributor
          {customerType === 'distributor' && (
            <CheckCircle2 size={16} className="text-green-300" />
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left - Profile Form */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-2 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={onProfileChange}
                placeholder="Your full name"
                className="w-full border border-gray-200 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-2 mb-1">Company Email*</label>
              <input
                type="email"
                name="companyEmail"
                value={profile.companyEmail}
                onChange={onProfileChange}
                placeholder="email@company.com"
                className="w-full border border-gray-200 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-2 mb-1">
                Company Name*
                <Info size={14} className="text-gray-400" />
              </label>
              <input
                type="text"
                name="companyName"
                value={profile.companyName}
                onChange={onProfileChange}
                placeholder="Company name"
                className="w-full border border-gray-200 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-2 mb-1">Reg. Address</label>
              <input
                type="text"
                name="regAddress"
                value={profile.regAddress}
                onChange={onProfileChange}
                placeholder="Registered address"
                className="w-full border border-gray-200 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-2 mb-1">GST No.</label>
              <input
                type="text"
                name="gstNo"
                value={profile.gstNo}
                onChange={onProfileChange}
                placeholder="GST Number"
                className="w-full border border-gray-200 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
              />
              <button className="flex items-center gap-1 text-xs text-primary font-medium mt-1.5 hover:underline">
                <Upload size={12} /> Upload Proof for verification
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-2 mb-1">Company Pan</label>
              <input
                type="text"
                name="companyPan"
                value={profile.companyPan}
                onChange={onProfileChange}
                placeholder="PAN Number"
                className="w-full border border-gray-200 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2 mt-5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => onAgreeTermsChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
            />
            <span className="text-sm text-gray-2">
              I agree to the{' '}
              <Link to="/terms" className="text-primary hover:underline">terms and conditions</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary hover:underline">privacy policy</Link>
            </span>
          </label>

          {/* Referral ID */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-2 mb-1">Referral ID</label>
            <input
              type="text"
              value={referralId}
              onChange={(e) => onReferralIdChange(e.target.value)}
              placeholder="Enter referral ID (optional)"
              className="w-full border border-gray-200 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400 max-w-sm"
            />
          </div>
        </div>

        {/* Right - Phone Verification */}
        <div className="lg:w-96 shrink-0">
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Phone size={20} className="text-primary" />
              <h4 className="font-heading font-semibold text-dark">
                Verify your Phone number
              </h4>
            </div>

            <label className="block text-sm font-medium text-gray-2 mb-1">Phone Number</label>
            <div className="flex gap-2 mb-2">
              <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 text-sm text-gray-600 shrink-0 bg-white h-[48px]">
                <span>+91</span>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => onPhoneNumberChange(e.target.value)}
                placeholder="98765 43210"
                className="w-full border border-gray-200 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400 bg-white"
                maxLength={10}
              />
            </div>
            <button className="text-primary text-xs font-medium hover:underline mb-5">
              Change number
            </button>

            {/* OTP input */}
            <label className="block text-sm font-medium text-gray-2 mb-1">Enter OTP</label>
            <div className="flex gap-2 mb-2">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={otp[idx] || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    onOtpChange((prev) => {
                      const arr = prev.split('')
                      arr[idx] = val
                      return arr.join('')
                    })
                    if (val && e.target.nextElementSibling) {
                      e.target.nextElementSibling.focus()
                    }
                  }}
                  className="w-12 h-12 text-center text-lg font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                />
              ))}
            </div>
            <p className="text-xs text-gray-3 mb-4">Resend in {otpTimer}s</p>

            {phoneVerified ? (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium py-2.5">
                <CheckCircle2 size={18} />
                Phone number verified
              </div>
            ) : (
              <button
                onClick={onVerifyOtp}
                className="btn-primary w-full"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
