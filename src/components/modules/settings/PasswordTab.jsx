import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function PasswordTab() {
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleUpdate = async () => {
    setError('')
    setSuccess(false)
    if (newPwd.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPwd !== confirmPwd) {
      setError('Passwords do not match')
      return
    }
    setSaving(true)
    // Demo mode: fake save delay
    await new Promise(r => setTimeout(r, 500))
    setSuccess(true)
    setCurrentPwd('')
    setNewPwd('')
    setConfirmPwd('')
    setSaving(false)
  }

  const PasswordField = ({ label, value, onChange, placeholder, show, setShow }) => (
    <div>
      <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#bdbdbd] hover:text-[#828282] cursor-pointer"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <h2 className="font-heading text-lg font-bold text-[#333] mb-6">Change Password</h2>

      <div className="space-y-5 max-w-lg">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-body rounded-xl px-4 py-3">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 text-sm font-body rounded-xl px-4 py-3">
            Password updated successfully
          </div>
        )}

        <PasswordField
          label="Current password"
          value={currentPwd}
          onChange={(e) => setCurrentPwd(e.target.value)}
          placeholder="Enter current password"
          show={showCurrent}
          setShow={setShowCurrent}
        />

        <PasswordField
          label="New password"
          value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)}
          placeholder="Enter new password"
          show={showNew}
          setShow={setShowNew}
        />

        <PasswordField
          label="Confirm password"
          value={confirmPwd}
          onChange={(e) => setConfirmPwd(e.target.value)}
          placeholder="Re-enter new password"
          show={showConfirm}
          setShow={setShowConfirm}
        />
        {confirmPwd && newPwd !== confirmPwd && (
          <p className="text-xs font-body text-red-500 -mt-3">Passwords do not match</p>
        )}

        <button
          onClick={handleUpdate}
          disabled={saving || success}
          className={`w-full py-3 bg-[#6d5ed6] text-white font-body font-semibold text-sm rounded-full hover:bg-[#5b4ec4] cursor-pointer transition-colors ${
            success ? 'opacity-60' : ''
          } disabled:opacity-60`}
        >
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </>
  )
}
