import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import OtpInput from '../../components/ui/OtpInput'

export default function LoginPage() {
  const [loginRole, setLoginRole] = useState('customer')
  const [mode, setMode] = useState('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [rememberMe, setRememberMe] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const startTimer = useCallback(() => {
    setOtpTimer(13)
  }, [])

  useEffect(() => {
    if (otpTimer <= 0) return
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [otpTimer])

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password, loginRole)
      navigate(loginRole === 'distributor' ? '/distributor/dashboard' : '/')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // OTP login not natively supported by Saleor — placeholder
      setError('OTP login is not available yet. Please use email/password.')
    } finally {
      setLoading(false)
    }
  }

  const sendOtp = async () => {
    if (mobile.length === 10) {
      // Demo mode: skip backend, just show OTP input
      setOtpSent(true)
      setError('')
      startTimer()
    }
  }

  const handleEditMobile = () => {
    setOtpSent(false)
    setOtp(['', '', '', ''])
    setError('')
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 md:p-12">
          <h1 className="font-heading text-2xl md:text-[28px] font-bold text-center text-gray-900 mb-6">
            Welcome Back
          </h1>

          {/* Role toggle */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <button
              type="button"
              onClick={() => setLoginRole('customer')}
              className={`px-6 py-2.5 rounded-full text-sm font-heading font-medium transition-all cursor-pointer ${
                loginRole === 'customer'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setLoginRole('distributor')}
              className={`px-6 py-2.5 rounded-full text-sm font-heading font-medium transition-all cursor-pointer ${
                loginRole === 'distributor'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Distributor
            </button>
          </div>

          {mode === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
              )}

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email Address"
                className="input-field"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input-field pr-12"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-gray-600 font-body">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-gray-700 font-body">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-full font-heading font-semibold text-base transition-colors disabled:opacity-60 cursor-pointer">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpLogin} className="space-y-5">
              {/* Phone number field */}
              <div className="input-field flex items-center">
                <span className="text-gray-500 text-sm font-medium mr-2 shrink-0">+91</span>
                {otpSent ? (
                  <>
                    <span className="flex-1 text-sm text-gray-900">{mobile}</span>
                    <button type="button" onClick={handleEditMobile}
                      className="text-primary text-sm font-medium ml-2 cursor-pointer">Edit</button>
                  </>
                ) : (
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter mobile number"
                    className="flex-1 outline-none text-sm placeholder-gray-400 bg-transparent"
                  />
                )}
              </div>

              {/* OTP field */}
              <div>
                <OtpInput
                  otp={otp}
                  setOtp={setOtp}
                  length={4}
                />

                {/* Error + Resend timer row */}
                {otpSent && (
                  <div className="flex items-center justify-between mt-2">
                    {error ? (
                      <span className="text-red-500 text-xs font-medium">{error}</span>
                    ) : (
                      <span />
                    )}
                    {otpTimer > 0 ? (
                      <span className="text-xs text-gray-400 font-body">
                        Resend in 00:{otpTimer.toString().padStart(2, '0')}
                      </span>
                    ) : (
                      <button type="button" onClick={sendOtp}
                        className="text-xs text-primary font-medium cursor-pointer">
                        Resend OTP
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                type={otpSent ? 'submit' : 'button'}
                onClick={!otpSent ? sendOtp : undefined}
                disabled={loading || (!otpSent && mobile.length < 10)}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-full font-heading font-semibold text-base transition-colors disabled:opacity-60 cursor-pointer">
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          )}

          <button
            onClick={() => { setMode(mode === 'email' ? 'otp' : 'email'); setError('') }}
            className="w-full mt-4 py-3.5 rounded-full border border-gray-300 text-gray-700 font-heading font-medium text-base hover:bg-gray-50 transition-colors cursor-pointer">
            {mode === 'email' ? 'Sign in using OTP' : 'Sign in using password'}
          </button>

          <p className="text-center text-sm text-gray-600 font-body mt-8">
            New customer?{' '}
            <Link to="/signup" className="text-primary hover:text-primary-dark font-semibold underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
