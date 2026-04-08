import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  SettingsEditView,
} from '../../components/modules/settings'

/* ───────────────────────────────────────────────
   Read-only Settings View (Distributor variant)
   ─────────────────────────────────────────────── */
function DistributorReadView({ user, onEdit }) {
  const rows = [
    { label: 'Full Name', value: user?.fullName || 'Not set' },
    { label: 'Email ID', value: user?.email || 'Not set' },
    { label: 'Mobile Phone Number', value: user?.mobile || 'Not set' },
    { label: 'Password', value: '******************' },
    {
      label: 'Company Details',
      value: user?.companyName
        ? `${user.companyName}${user.pan ? ', Pan' : ''}${user.gst ? ', GST no...' : ''}`
        : 'Company name, Pan, GST no...',
    },
  ]

  return (
    <div>
      {/* Title with purple underline accent */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-[#1a1036]">MY SETTINGS</h1>
        <div className="w-16 h-1 bg-[#6d5ed6] rounded-full mt-2" />
      </div>

      {/* Card with read-only rows */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex flex-col sm:flex-row sm:items-center px-6 sm:px-8 py-4 ${
              i < rows.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <span className="text-sm text-gray-500 sm:w-56 shrink-0">{row.label}</span>
            <span className="text-sm font-medium text-[#1a1036]">{row.value}</span>
          </div>
        ))}

        {/* Edit Profile button */}
        <div className="px-6 sm:px-8 py-5">
          <button onClick={onEdit} className="btn-primary w-full rounded-full cursor-pointer">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────────────────────────────
   Edit Settings View (Distributor variant)
   ─────────────────────────────────────────────── */
function DistributorEditView({ user, onBack }) {
  return (
    <SettingsEditView
      user={user}
      onBack={onBack}
      entityLabel="Distributor Name"
    />
  )
}

/* ───────────────────────────────────────────────
   Main Distributor Settings Page
   ─────────────────────────────────────────────── */
export default function DistributorSettings() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="section-container py-8 sm:py-12">
        {editing ? (
          <DistributorEditView user={user} onBack={() => setEditing(false)} />
        ) : (
          <DistributorReadView user={user} onEdit={() => setEditing(true)} />
        )}
      </div>
    </div>
  )
}
