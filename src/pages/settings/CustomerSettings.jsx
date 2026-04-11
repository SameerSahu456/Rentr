import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  SettingsReadView,
  SettingsEditView,
  ProfileTab,
  PasswordTab,
  CompanyTab,
  OtpModal,
} from '../../components/modules/settings'

/* ───────────────────────────────────────────────
   Main Customer Settings Page
   ─────────────────────────────────────────────── */
export default function CustomerSettings() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)

  return (
    <div className="min-h-screen bg-[#f2f2f2]/30">
      <div className="section-container py-8 sm:py-12">
        {editing ? (
          <SettingsEditView user={user} onBack={() => setEditing(false)} />
        ) : (
          <SettingsReadView user={user} onEdit={() => setEditing(true)} />
        )}
      </div>
    </div>
  )
}

export { ProfileTab, CompanyTab, PasswordTab, OtpModal }
