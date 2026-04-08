import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import EditSidebar from './EditSidebar'
import ProfileTab from './ProfileTab'
import PasswordTab from './PasswordTab'
import CompanyTab from './CompanyTab'

export default function SettingsEditView({ user, onBack, entityLabel }) {
  const [sidebarTab, setSidebarTab] = useState('profile')
  const [companyExpanded, setCompanyExpanded] = useState(false)
  const [companySubTab, setCompanySubTab] = useState('company')

  return (
    <div>
      {/* Header with back arrow */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="text-[#828282] hover:text-[#333] cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-heading text-[20px] font-bold text-[#333] uppercase tracking-wide">
            EDIT SETTINGS
          </h1>
        </div>
        <div className="w-16 h-1 bg-[#6d5ed6] rounded-full ml-8" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <EditSidebar
          sidebarTab={sidebarTab}
          setSidebarTab={setSidebarTab}
          companyExpanded={companyExpanded}
          setCompanyExpanded={setCompanyExpanded}
          companySubTab={companySubTab}
          setCompanySubTab={setCompanySubTab}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-[#f2f2f2] p-6 sm:p-8">
            {sidebarTab === 'profile' && <ProfileTab user={user} />}
            {sidebarTab === 'password' && <PasswordTab />}
            {sidebarTab === 'company' && (
              <CompanyTab user={user} activeSubTab={companySubTab} entityLabel={entityLabel} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
