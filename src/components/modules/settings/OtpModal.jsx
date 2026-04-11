import { useState } from 'react'
import Modal from '../../common/Modal'
import OtpInput from '../../ui/OtpInput'
import useOtpTimer from '../../../hooks/useOtpTimer'

export default function OtpModal({ type, value, onClose, onVerify, step = 'verification', onEdit }) {
  const [otp, setOtp] = useState(['', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const { minutes, seconds } = useOtpTimer(780)

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 4) return
    setVerifying(true)
    await onVerify(code)
    setVerifying(false)
  }

  const typeLabel = type === 'phone' ? 'mobile number' : 'email id'

  if (step === 'verification') {
    return (
      <Modal onClose={onClose}>
        <h2 className="font-heading text-xl font-bold text-[#17113e] mb-2">
          Verification Required
        </h2>
        <p className="text-sm font-body text-[#828282] mb-6">
          For better security, you must verify your identity. An OTP will be sent to your {typeLabel}{' '}
          <span className="font-medium text-[#17113e]">{value}</span>
        </p>

        <OtpInput otp={otp} setOtp={setOtp} />

        <p className="text-center text-sm font-body text-[#828282] mb-6">
          Resend OTP in{' '}
          <span className="font-medium text-[#6d5ed6]">{minutes}:{seconds}</span>
        </p>

        <button
          onClick={handleVerify}
          disabled={otp.join('').length < 4 || verifying}
          className="w-full py-3 bg-[#6d5ed6] text-white font-body font-semibold text-sm rounded-full hover:bg-[#5b4ec4] disabled:opacity-60 cursor-pointer transition-colors"
        >
          {verifying ? 'Verifying...' : 'Verify'}
        </button>
      </Modal>
    )
  }

  if (step === 'verify-new') {
    return (
      <Modal onClose={onClose}>
        <h2 className="font-heading text-xl font-bold text-[#17113e] mb-2">
          Verify with OTP
        </h2>
        <p className="text-sm font-body text-[#828282] mb-6">
          OTP sent to your {typeLabel}{' '}
          <span className="font-medium text-[#17113e]">{value}</span>{' '}
          {onEdit && (
            <button onClick={onEdit} className="text-[#6d5ed6] font-medium hover:underline cursor-pointer">
              Edit
            </button>
          )}
        </p>

        <OtpInput otp={otp} setOtp={setOtp} />

        <p className="text-center text-sm font-body text-[#828282] mb-6">
          Resend OTP in{' '}
          <span className="font-medium text-[#6d5ed6]">{minutes}:{seconds}</span>
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleVerify}
            disabled={otp.join('').length < 4 || verifying}
            className="flex-1 py-3 bg-[#6d5ed6] text-white font-body font-semibold text-sm rounded-full hover:bg-[#5b4ec4] disabled:opacity-60 cursor-pointer transition-colors"
          >
            {verifying ? 'Verifying...' : 'Verify'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-gray-300 text-[#4f4f4f] font-body font-medium text-sm hover:bg-[#f2f2f2] cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      </Modal>
    )
  }

  return null
}
