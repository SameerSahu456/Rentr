import { useState } from 'react'
import OtpModal from './OtpModal'
import ChangeValueModal from './ChangeValueModal'
import SuccessModal from './SuccessModal'

export default function ProfileTab({ user }) {
  const [fullName, setFullName] = useState(user?.full_name || user?.fullName || '')
  const [mobile] = useState(user?.phone || user?.mobile || '')
  const [email] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)

  // Modal flow state
  const [changeModal, setChangeModal] = useState(null)
  const [otpModal, setOtpModal] = useState(null)
  const [successModal, setSuccessModal] = useState(null)

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await fetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ full_name: fullName }),
      })
    } catch {
      // handle error
    } finally {
      setSaving(false)
    }
  }

  const handleChangeClick = (type) => {
    setChangeModal({ type })
  }

  const handleChangeSubmit = (newValue) => {
    const type = changeModal.type
    setChangeModal(null)
    setOtpModal({ type, value: newValue, step: 'verify-new' })
  }

  const handleOtpVerify = async () => {
    const { type, value } = otpModal
    setOtpModal(null)
    setSuccessModal({ type, value })
  }

  const handleOtpEdit = () => {
    const type = otpModal.type
    setOtpModal(null)
    setChangeModal({ type })
  }

  return (
    <>
      <h2 className="font-heading text-lg font-bold text-[#333] mb-6">Profile Details</h2>

      <div className="space-y-5 max-w-lg">
        <div>
          <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
            Email ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={email}
              readOnly
              className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm font-body text-[#828282] bg-[#f2f2f2] outline-none"
            />
            <button
              onClick={() => handleChangeClick('email')}
              className="px-5 py-3 text-sm font-medium font-body text-[#6d5ed6] border border-[#6d5ed6] rounded-xl hover:bg-[#6d5ed6]/5 whitespace-nowrap cursor-pointer transition-colors"
            >
              Change email
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
            Phone Number
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mobile}
              readOnly
              className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm font-body text-[#828282] bg-[#f2f2f2] outline-none"
            />
            <button
              onClick={() => handleChangeClick('phone')}
              className="px-5 py-3 text-sm font-medium font-body text-[#6d5ed6] border border-[#6d5ed6] rounded-xl hover:bg-[#6d5ed6]/5 whitespace-nowrap cursor-pointer transition-colors"
            >
              Change number
            </button>
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={saving}
          className="w-full py-3 bg-[#6d5ed6] text-white font-body font-semibold text-sm rounded-full hover:bg-[#5b4ec4] disabled:opacity-60 cursor-pointer transition-colors"
        >
          {saving ? 'Updating...' : 'Update changes'}
        </button>
      </div>

      {/* Change Value Modal */}
      {changeModal && (
        <ChangeValueModal
          type={changeModal.type}
          onClose={() => setChangeModal(null)}
          onSubmit={handleChangeSubmit}
        />
      )}

      {/* OTP Modal */}
      {otpModal && (
        <OtpModal
          type={otpModal.type}
          value={otpModal.value}
          step={otpModal.step}
          onClose={() => setOtpModal(null)}
          onVerify={handleOtpVerify}
          onEdit={handleOtpEdit}
        />
      )}

      {/* Success Modal */}
      {successModal && (
        <SuccessModal
          type={successModal.type}
          value={successModal.value}
          onClose={() => setSuccessModal(null)}
        />
      )}
    </>
  )
}
