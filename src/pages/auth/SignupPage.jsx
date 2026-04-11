import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Info, Upload, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
// Demo mode: no backend API needed
import { CAROUSEL_SLIDES } from '../../constants/auth'
import SignupCarousel from '../../components/modules/auth/SignupCarousel'

export default function SignupPage() {
  const [activeTab, setActiveTab] = useState('customer')
  const [formData, setFormData] = useState({
    fullName: '',
    website: '',
    companyEmail: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: '',
    gstTin: '',
    companyPan: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const { register } = useAuth()
  const navigate = useNavigate()

  /* Auto-rotate carousel */
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleChange = useCallback(
    (field) => (e) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    },
    [],
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!agreeTerms) {
      setError('Please agree to the terms and conditions')
      return
    }
    setError('')
    setLoading(true)
    try {
      await register({
        email: formData.companyEmail,
        password: formData.password,
        firstName: formData.fullName.split(' ')[0] || '',
        lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
        phone: formData.phoneNumber,
        companyName: formData.companyName,
        role: activeTab,
        industry: formData.industry,
        gstin: formData.gstTin,
        companyPan: formData.companyPan,
      })
      navigate(activeTab === 'distributor' ? '/distributor/dashboard' : '/')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[1100px] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex">
        {/* Left side - Form */}
        <div className="flex-1 p-5 sm:p-8 md:p-10 lg:p-12">
          <h1 className="font-heading text-2xl font-bold text-gray-900 mb-6">Create new account</h1>

          {/* Customer / Distributor toggle */}
          <div className="flex items-center gap-2 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab('customer')}
              className={`px-6 py-2.5 rounded-full text-sm font-heading font-medium transition-all cursor-pointer ${
                activeTab === 'customer'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('distributor')}
              className={`px-6 py-2.5 rounded-full text-sm font-heading font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'distributor'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Distributor
              <Info size={14} className="opacity-60" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
            )}

            {/* Row 1: Full Name + Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-body mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange('fullName')}
                  placeholder="Enter name here"
                  className="input-field-rect"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-body mb-1.5">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={handleChange('website')}
                  placeholder="www.example.com"
                  className="input-field-rect"
                />
              </div>
            </div>

            {/* Row 2: Company Email + Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-body mb-1.5">
                  Company Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.companyEmail}
                  onChange={handleChange('companyEmail')}
                  placeholder="example@email.com"
                  className="input-field-rect"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-body mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange('phoneNumber')}
                  placeholder="Enter phone number"
                  className="input-field-rect"
                />
              </div>
            </div>

            {/* Row 3: Password + Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-body mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange('password')}
                    placeholder="Min 8 characters"
                    className="input-field-rect pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-body mb-1.5">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    placeholder="Re-enter password"
                    className="input-field-rect pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            {/* Company Name + Industry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-body mb-1.5">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange('companyName')}
                  placeholder="Enter name as per Pan/ Govt ID"
                  className="input-field-rect"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-body mb-1.5">
                  Industry
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={handleChange('industry')}
                  placeholder="Eg. IT"
                  className="input-field-rect"
                />
              </div>
            </div>

            {/* Row 4: GST TIN + Company PAN + Upload Proof */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-body mb-1.5">
                  GST TIN
                </label>
                <input
                  type="text"
                  value={formData.gstTin}
                  onChange={handleChange('gstTin')}
                  placeholder="Entet GST number"
                  className="input-field-rect"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700 font-body">
                    Company PAN
                  </label>
                  <label className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary cursor-pointer transition-colors">
                    <Upload size={14} />
                    <span className="font-medium">Upload Proof</span>
                    <input type="file" className="hidden" />
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.companyPan}
                  onChange={handleChange('companyPan')}
                  placeholder="Enter PAN number"
                  className="input-field-rect"
                />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-xs text-gray-500 font-body">
                I agree to the{' '}
                <Link to="/rental-terms" className="text-primary underline">
                  terms and conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy-policy" className="text-primary underline">
                  privacy policy
                </Link>
              </span>
            </label>

            {/* Buttons + Already a user */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-dark text-white px-10 py-3 rounded-full font-heading font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer"
              >
                {loading ? 'Creating...' : 'Create account'}
              </button>
              <p className="text-sm text-gray-600 font-body">
                Already a user?{' '}
                <Link to="/login" className="text-primary hover:text-primary-dark font-semibold">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Right side - Purple marketing panel with carousel */}
        <SignupCarousel activeSlide={activeSlide} setActiveSlide={setActiveSlide} />
      </div>
    </div>
  )
}
